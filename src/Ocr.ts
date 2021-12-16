import { rejects } from "assert";
import * as fs from 'fs';
import * as path from 'path';

import Jimp from 'jimp'
import Tesseract from "tesseract.js";
// tslint:disable-next-line: no-var-requires
const jimp: Jimp = require('jimp')

// tslint:disable-next-line: no-var-requires
const tesseract = require('tesseract.js');


const { createWorker } = require('tesseract.js');


export class Ocr
{

    private PngPath : string;
    private worker : Tesseract.Worker;
    private title : string;
    private artist : string;

    public isReady : boolean = false;

    constructor() {
        this.PngPath = "";
        this.worker = createWorker({
            langPath: path.join(__dirname, '../src/OCR'),
        });
        this.title = "";
        this.artist = "";
    }

    private croppng(callback : CallableFunction)
    {   
        // @ts-ignore
        jimp.read(this.PngPath).then(img => {
            img.crop(225, img.bitmap.height - 50, img.bitmap.width - 800, 50).write(this.PngPath, callback);
        });
    }

    private processOcr()
    {
        let regex : string = "/(.*) - (.*)/";
        (async () => {
            await this.worker.load();
            await this.worker.loadLanguage('eng');
            await this.worker.initialize('eng');
            const { data: { text } } = await this.worker.recognize(this.PngPath);

            try {
                let parts : any = text.match(regex);
                this.title = parts[0];
                this.artist = parts[1];
                this.isReady = true;
            }catch(e){
                this.isReady = false;
                console.error(e);
            }

            console.log(text);
            await this.worker.terminate();
          })();
    }
    
    public readPng(path : string){
        this.PngPath = path;
        this.croppng(() => {
            this.processOcr();    
        });
    }

    public getArtiste() : string
    {
        return this.artist;
    }

    public getTitle() : string
    {
        return this.title;
    }
}