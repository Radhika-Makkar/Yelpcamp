if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const dbUrl='mongodb://localhost:27017/yelpcamp2';
const express = require('express');
const path = require('path');
const ejsMate= require('ejs-mate');
const ExpressError=require('./utils/ExpressError')
const methodOverride = require('method-override');
const mongoose= require('mongoose');
const session=require('express-session');
const campgroundRoutes=require('./routes/campground');
const reviewRoutes=require('./routes/reviews');
const flash=require('connect-flash');
const passport=require('passport');
const localStrategy=require('passport-local');
const User=require('./models/user');
const MongoDBStore=require('connect-mongo')(session);

const userRoutes=require('./routes/users');
const { MongoStore } = require('connect-mongo');

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify:false
});


const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));

db.once("open", () => {
    console.log("Database connected");
})
const secret=process.env.SECRET || 'thisshouldbeasecret'
  const app = express();
  const store=new MongoDBStore({
      url:dbUrl,
      secret,
     touchAfter:24*60*60

  })
  store.on('error',function(e)
  {
      console.log("error is there");
  })
  const sessionConfig={
    store,
    secret,
    resave:false,
    saveUninitialized:true,
    cookie:
    {
        httpOnly:true,
        expires:Date.now()+1000*60*60*24*7,
        maxAge:1000*60*60*24*7
    }
    
}

app.engine('ejs',ejsMate)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

app.use(express.static(path.join(__dirname,'public')));
app.use(session(sessionConfig))
app.use(flash());

app.use(passport.initialize())
app.use(passport.session());

passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next)=>
    {
        console.log(req.session);
        res.locals.currentUser=req.user;
res.locals.success=req.flash('success');
res.locals.error=req.flash('error');
next();
    })
app.get('/fakeUser',async(req,res)=>
{
    const user=new User({email:'radhika@gmail.com',
    username:'radhika'})
   const newUser=await User.register(user,'chicken')
   res.send(newUser)
})
app.use('/',userRoutes);
app.use('/campgrounds',campgroundRoutes)
app.use('/campgrounds/:id/reviews',reviewRoutes)

       
app.get('/', (req, res) => {
    res.render('home')
});

app.all('*',(req,res,next)=>
{next(new ExpressError('Page Not Found',404))
});

app.use((err,req,res,next)=>
{
    const {statusCode=500}=err;
    if(!err.message) err.essage='Oh No!Something went wrong!'
    res.status(statusCode).render('error',{err});

})

app.listen(8000, () => {
    console.log('Serving on port 3000')
})