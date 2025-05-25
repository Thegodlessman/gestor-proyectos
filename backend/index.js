import express, {urlencoded} from 'express'
import cors from 'cors'

const app = express()

app.use(express.urlencoded({extended: true}));
app.use(express.json())

app.use(cors())

const PORT = process.env.PORT

app.listen(PORT, ()=>{
    console.log(`Server on port ${PORT}`)
})