//el primero que se ejecuta
const mongoose = require('mongoose');
const app = require('./app');
const PORT_SERVER = process.env.PORT || 3977; //3977// Puerto de mi api back end, si hay una variable de entorno configuarada en mi servidor coge esa y si no el puerto 3977

const { API_VERSION, IP_SERVER, PORT_DB } = require("./config");

mongoose.set("useFindAndModify", false); // Para solucionar error de depracationWarning

mongoose.connect(
    `mongodb://${IP_SERVER}:${PORT_DB}/potenciadatabase`, 
    {useNewUrlParser: true, useUnifiedTopology: true}, 
    (err, res) => {
        if(err) {
            throw err;
        }
        else {
            console.log("CONEXION CON LA BD CORRECTA");
            app.listen(PORT_SERVER, () => { 
                console.log("Direccion:"); 
                console.log(`http://${IP_SERVER}:${PORT_SERVER}/api/${API_VERSION}/`); 
            });
        
        }    
    }
);

