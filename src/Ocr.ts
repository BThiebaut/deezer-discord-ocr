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

    constructor() {
        this.PngPath = "";
        this.worker = createWorker({
            langPath: path.join(__dirname, '../src/OCR'),
        });
    }

    private croppng(callback : CallableFunction)
    {   
        // @ts-ignore
        jimp.read(this.PngPath).then(img => {
            img.crop(0, img.bitmap.height - 80, img.bitmap.width, 80).write(this.PngPath, callback);
        });
    }

    private processOcr()
    {
        (async () => {
            await this.worker.load();
            await this.worker.loadLanguage('eng');
            await this.worker.initialize('eng');
            const { data: { text } } = await this.worker.recognize(this.PngPath);
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
        return "";
    }

    public getTitle() : string
    {
        return "";
    }
}