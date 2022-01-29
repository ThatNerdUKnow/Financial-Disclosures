import im from 'imagemagick'
import {promises as fs} from 'fs'
processPDF(".pdf/example.pdf")

async function processPDF(path)
{
    im.convert([path,'./img/output.jpg'],(err,stdout)=>{
        if(err)
        {
            throw `Couldn't Process ${path}`
        }

    })
}