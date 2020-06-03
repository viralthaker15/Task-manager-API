// CRUD

const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const connectionURL = 'mongodb://127.0.0.1:27017'
const databaseName = 'task-manager'

///MongoDB/bin/mongod.exe --dbpath=/MongoDB-Data : to start the mongoDB
// useUnified and useNewUrl was used to remove some type of warning

MongoClient.connect(connectionURL, { useNewUrlParser: true , useUnifiedTopology: true } , (error, client) => {
    if(error)
    {
        return console.log('Unable to connect to database!')
    }

    const db = client.db(databaseName)
    // db.collection('users').insertOne({
    //     name : 'Viral',
    //     age : '22'
    // }, (error , result) => {
    //     if(error)
    //     {
    //         return console.log('Unable to insert user')
    //     }

    //     console.log(result.ops)
    // })

    // db.collection('users').insertMany([
    //     {
    //         name: 'Ramesh',
    //         age: 56
    //     },{
    //         name: 'Harshida',
    //         age: 50
    //     }
    // ],(error , result) => {
    //     if(error)
    //     {
    //        return console.log('Unable to insert documents')
    //     }

    //    console.log(result.ops)
    // })


    // db.collection('tasks').insertMany([
    //     {
    //         description : 'cricket',
    //         completed : false
    //     },
    //     {
    //         description : 'hand tennis',
    //         completed : true
    //     },
    //     {   
    //         description : 'CSGO',
    //         completed : true
    //     }
    // ], (error , result) => {
    //     if(error)
    //     {
    //         return console.log('Unable to insert tasks!')
    //     }

    //     console.log(result.ops)
    // })

    db.collection('tasks').updateMany({
        completed : false
    } , {
        $set: { completed : true}
    }).then((result) => {
        console.log(result)
    }).catch((error) => {
        console.log(error)
    })


}) 