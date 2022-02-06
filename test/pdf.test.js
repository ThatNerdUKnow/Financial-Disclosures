import { assert } from 'chai'
import sinon from 'sinon'
import pdf from '../pdf.js'
import axios from 'axios'
import { promises as fs } from 'fs'
import im from 'imagemagick'
import path from 'path'

const PDF_BUFFER = Buffer.from("A whole bunch of PDF data");
const JPG_BUFFER = Buffer.from("A whole bunch of JPG data");

describe("pdf.js", async () => {
    let axiosStub
    let writeFileStub
    let imStub
    let readdirStub
    let readFileStub


    const PDF_PATH = "./config/pdf/test.pdf"

    beforeEach(() => {
        axiosStub = sinon.stub(axios, 'get');
        writeFileStub = sinon.stub(fs, 'writeFile')
        imStub = sinon.stub(im, 'convert')
        readdirStub = sinon.stub(fs, 'readdir')
        readFileStub = sinon.stub(fs, 'readFile')


        imStub.yields(undefined)
        readdirStub.resolves(["test-0.jpg", "test-1.jpg", "test-2.jpg", "test-3.jpg", "test-4.jpg",])
        axiosStub.resolves({ data: PDF_BUFFER })
        readFileStub.resolves(JPG_BUFFER)
    })



    describe("ProcessPDF", () => {


        it("Does not fail", async () => {
            await pdf.processPDF(PDF_PATH)

        })

        it("Contains keys pdf and images", async () => {
            let result = await pdf.processPDF(PDF_PATH)
            assert.hasAllKeys(result, ["pdf", "images"])
        })

        it("Does not mutate pdf's path", async () => {
            let result = await pdf.processPDF(PDF_PATH)
            assert.equal(result.pdf, PDF_PATH)
        })

        it("Calls readdir correctly", async () => {
            await pdf.processPDF(PDF_PATH)
            assert.isOk(readdirStub.calledOnce)
            assert(readdirStub.calledWith("./config/img/"))
        })

        it("Images contain keys path and buffer", async () => {
            let { images } = await pdf.processPDF(PDF_PATH)
            images.forEach(image => {
                assert.hasAllKeys(image, ["path", "buffer"])
            })
        })

        it("does not mutate JPG Buffers", async () => {
            let { images } = await pdf.processPDF(PDF_PATH)
            let buffers = images.map(image => {
                return image.buffer
            })

            buffers.forEach(buffer => {
                assert.equal(buffer, JPG_BUFFER)
            })
        })

        it("Image paths and pdf's path have similar baseNames", async () => {
            let result = await pdf.processPDF(PDF_PATH)
            let pdfPath = result.pdf
            let baseName = path.basename(pdfPath, ".pdf")
            let imagePaths = result.images.map(image => { return image.path })

            imagePaths.forEach(imagePath => {
                assert(imagePath.includes(baseName))
            })
        })


    })


    afterEach(() => {
        axiosStub.restore()
        writeFileStub.restore()
        imStub.restore()
        readdirStub.restore()
        readFileStub.restore()
    })
})