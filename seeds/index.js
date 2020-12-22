
const cities=require('./cities');
const mongoose=require('mongoose');
const {places,descriptors}=require('./seedHelpers');
const Campground=require('../models/campground')
mongoose.connect('mongodb://localhost:27017/yelpcamp2',{
    useNewUrlParser:true,
useCreateIndex:true,useUnifiedTopology:true})


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const sample=(array)=>array[Math.floor(Math.random()*array.length)];

const seedDB=async()=>
{
    await Campground.deleteMany({});
    for(let i=0;i<50;i++)
    {
        const random1000=Math.floor(Math.random()*1000);
       const price=Math.floor(Math.random()*20)+10;
        const c=new Campground({
            location:`${cities[random1000].city},
            ${cities[random1000].state}`,
            title:`${sample(descriptors)} ${sample(places)}`,
        image:'https://source.unsplash.com/collection/483251',
        description:'Lorem ipsum, dolor sit amet consectetur adipisicing elit. Laudantium error commodi itaque maiores, eaque voluptate, nemo iusto cumque delectus perferendis ducimus eligendi hic accusamus molestias ut mollitia ullam debitis libero'
   ,price
 })
     await c.save();
    }


}

seedDB().then(()=>
{
    mongoose.connection.close();
});









