'use strict';
const mysql = require('mysql');
const fs = require('fs');
const { exit } = require('process');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config();
/**
 * Description of Track
 *
 * @author Alkemika Lab
 */
class ak_jscore {
    /**
     * Gestione database
     * @param {Object} option - Connessione al db
     * */
    constructor(option) {
        this.option = option;
        this.errorconn = false;
        this.error = false;
        this.Connection(option);
        this.result;
    }

    Connection(option) {
        let dataconn = "";
        if (option) {
            dataconn = option;
        } else {
            let rawdata = process.env.ACCESSDBINT;//fs.readFileSync(path.resolve(__dirname,'data/conn.json'))
            dataconn = JSON.parse(rawdata);
        }
        if (dataconn) {
            if (!dataconn.host || !dataconn.user || !dataconn.password || !dataconn.database) {
                this.errorconn = true;
            } else {
                this.conn = mysql.createPool(dataconn);
            }
        } else {
            this.errorconn = true;
        }
    }

    /**
     * Invia Query
     * @param {String} query Stringa Query<br>
     * @return {Object}.
     **/
    async Query(query) {
        let rows
        if (!this.errorconn) {
            rows= await this.#getQuery(query)
        } else {
            console.log("error data connection")
        }
        //this.conn.end()
        return rows; 
    }
    
    Close() {
        this.conn.end()
    }

    #getQuery(query){
        query = query.replace(/  +/g, ' ');
        return new Promise((resolve, reject)=>{
           this.result=  this.conn.query(query, (err, result) => {
                if (err) {
                    reject(err.sqlMessage);
                } else {
                    this.result=result;
                    resolve(result) 
                }
            });
        })
    }


    /**
     * Salva tracciamento
     * @param $get array dati del link<br>
     * array request get o post.
     * @return array.
     **/
    print() {
        console.log('Name is :' + this.option);
    }

}

module.exports = ak_jscore;