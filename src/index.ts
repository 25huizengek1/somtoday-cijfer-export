import { launch } from "puppeteer";
import { getConfig } from "./config";
import { sequentially, wait } from "./util";
import { z } from "zod";
import { join } from "path";
import { mkdir } from "fs/promises";

const usernameSelector = "input[name=\"usernameFieldPanel:usernameFieldPanel_body:usernameField\"]";
const passwordSelector = "input[name=\"passwordFieldPanel:passwordFieldPanel_body:passwordField\"]";
const gradesSelector = "select[name=\"tweeluikPanel:tweeluikMaster:cijfersMaster:plaatsingSelect\"]";

(async () => {
    const config = await getConfig();
    if (config == null) return console.error("Define a valid config in config.json!");

    const { schoolName, username, password, delay, screenshotDirectory } = config;

    const browser = await launch({
        headless: false,
        defaultViewport: {
            width: 1920,
            height: 1080
        },
        args: ["--start-maximized"]
    });
    const page = await browser.newPage();
    await (await browser.pages())[0].close();

    await page.bringToFront();
    await page.goto("https://somtoday.nl/");
    await page.waitForNetworkIdle();

    await page.type("#organisatieSearchField", schoolName, { delay });
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    await page.type(usernameSelector, username, { delay });
    await page.keyboard.press("Enter");
    await page.waitForNavigation();
    await page.type(passwordSelector, password, { delay });
    await page.keyboard.press("Enter");

    await page.waitForSelector("#grades");
    await page.click("#grades");

    await page.waitForSelector(gradesSelector);
    const unsafeOptions = await page.$eval(gradesSelector, async s =>
        (Array.prototype.slice.call(((s as HTMLSelectElement).options)) as HTMLOptionElement[])
            .filter(o => !!o)
            .map(o => ({ id: o.value, name: o.innerText.replace("/", "-") }))
    );
    const options = z.array(
        z.object({
            id: z.coerce.number(),
            name: z.string().min(1)
        })
    ).parse(unsafeOptions);

    let id: string;
    await sequentially(options.map(option => async () => {
        const dir = join(__dirname, "..", screenshotDirectory, option.name);
        await mkdir(dir, { recursive: true });
        await Promise.all([
            page.goto(`https://elo.somtoday.nl/home/grades?plaatsing=${option.id}`),
            page.waitForSelector("body:not(.nprogress-busy)")
        ]);

        await page.waitForSelector(".cijfersMaster");
        id = await page.$eval(".cijfersMaster", el => el.id);

        const widthPx = await page.$eval("#header", el => el.clientWidth);

        await wait(5000);

        const getSubjects = async () => {
            const unsafeSubjectIds = await page.$eval(`#${id}`, master => {
                const grades = Array.prototype.slice.call(master.querySelectorAll(".m-wrapper > .m-element")) as HTMLDivElement[];
                grades.shift(); // 'Cijferoverzicht'
                return grades.map(d => d.id);
            });
            return z.array(z.coerce.string().min(1).transform(s => `#${s}`)).parse(unsafeSubjectIds);
        };

        let subjectIds = await getSubjects();
        await sequentially(Array(subjectIds.length).fill(0).map((_, idx) => async () => {
            const subject = subjectIds[idx];
            await page.waitForSelector(subject);
            await page.click(subject);
            await page.waitForNavigation();
            await page.waitForSelector(".panel-header > .r-content > h2");

            const subjectName = await page.$eval(".panel-header > .r-content > h2", n => n.innerText);

            await sequentially((await page.$$(".glevel")).reverse().map(b => () => b.click()));
            await wait(1000);

            await sequentially((await page.$$(".gperiod.expand")).reverse().map(b => () => b.click()));
            await wait(200);

            await page.mouse.move(0, 0);
            await wait(1000);

            await page.screenshot({
                captureBeyondViewport: true,
                path: join(dir, `${subjectName}.png`),
                clip: {
                    x: ((page.viewport()?.width ?? 0) - widthPx) / 2,
                    y: 0,
                    width: widthPx,
                    height: await page.evaluate(() => document.body.scrollHeight),
                    scale: 1.5
                }
            });

            await wait(1000);
            subjectIds = await getSubjects();
        }));

        await page.click(subjectIds[subjectIds.length - 1]);
    }));

    await browser.close();
})();
