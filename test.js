const { akdb, akquery, aktable } = require('./index');

const table = new aktable();
const querydb = new akquery();
const db = new akdb();
//table.CreateTable("tb_utenti");
//table.RenameTable("ciao","tb_utenti");
//table.EmptyTable("tb_utenti");
/*
let newcol=[
    {
        name:"eta",
        datatype:"int(11)",
    },
    {
        name:"email",
        datatype:"varchar(255)",
        default:"NULL",
        order:"AFTER cognome",
    }
];
let editcol=
    {
        name:"eta",
        newname:"old",
        datatype:"varchar(55)"
    };
    
table.EditColumn(
    "tb_utenti", 
    {
        name:"eta", 
        datatype: "varchar(55)" 
    });    
*/

// console.log(Op.eq);
// console.log(Op.adjacent)

/*

let option = {
    fields: ['field1', 'field2'],
    join: {
        'nametable': { id: 'idtabella' }
    },
    where: {
        and: {
            "namefield1": {
                [Op.between]: 'value'
            },
            'namefield2': 25
        },
        order: { desc: 'namefield' }
    }
};

querydb.select("tb_table",
    ['@field1', 'field2',
        {
            setfunc: ["min", { setfunc: ["year", "field4"] }, "#minimo"]
        },
        {
            setfunc: ["sum", "aaaa*bbbbb", "#somma"]
        },
        {
            setfunc: ["IF", "field4>'5'", { setfunc: ["MONTH", "field5"] }, { setfunc: ["min", "sss"] }, "#diff"]
        }
    ]
).join(
    {
        'nametable#<': { "id": 'idtabella' },
        'nametable2#<>': { "id": 'idtabella2' }
    }
).where(
    {
        "AND": {
            "namefiled1": 'value',
            setfunc: { "year": ['namefiled0'], "=": ["2022", "2021"] },
            "namefiled2#>": { setfunc: ['year', 'fieldate'] },
            "namefiled3#!": ['value2', 'value3'],
        },
        "or#primo": {
            "namefield5": ['5', '9'],
            "namefield6": "7"
        },
        "or#secondo": {
            "namefield8": ['88', '90'],
            "namefield9": { setfunc: ["month", "73"] }
        }
    }
).order(
    { "fiel01": "aSC", "fiel02": "d" }
).limit(
    { page: 2, row: 16 }
).group(["field99","field100"]).run();

*/
//console.log(querydb.option);
//querydb.select("tb_table2").where({and:{id:"55",visible:1}}).run();
//console.log(querydb.option);
// let res= querydb.get("sdd_-dd",option);


// const regex = new RegExp('(?<join><>|><|<|>)', 'g')
// const str = `Call me < Sally.<>`;

// while ((array1 = regex.exec(str)) !== null) {
//     console.log(array1.groups.join)
//     console.log(`Found ${array1[0]}. Next starts at ${regex.lastIndex}.`);
// }

//query.AddColumns("tb_utenti",newcol)
//query.DeleteTable("ciao");
//table.CreateTable("tb_utenti2");




// datatest().then((res) => {
//     console.log(`SQL: ${querydb.option.sql}`)
//     console.log(querydb.msgError)
//     if (res) {
//         console.log("count:"  + res.length)
//         return res[0]
//     }
// }).then((res1) => {
//     if (res1) {
//         return res1.cognome
//     }
// }).then((res2) => {
//     if (res2) {
//         console.log(res2)
//     }
// }).catch((err) => {
//     console.log(`Error: ${err}`)
//     console.log(`SQL: ${querydb.option.sql}`)
// })

let tableName = "tb_utenti"
let eta = 20
let nome = "la"
let limit = 100
let where = { "AND": { "eta#>": eta, "nome#@": nome } }

async function datatest() {
    let result;
    return result = await querydb.findOne(tableName).where(where).limit(100).run()
}

datatest().then((res) => {
    console.log(res.nome)
})

const updatedb = new akquery();

async function datatest2() {
    let values = {
        nome: 'saverio',
        cognome: 'ruoccolo',
        email: 'sssssss', 
        "eta": "5"
    }
    try {
        await updatedb.update(tableName, values).where({ "AND": { "id": 1046 } }).run().then((res) => {
            console.log(res)
            return res
        }).catch((err) => {
            console.log(`Error: ${err}`)
        })
    } catch (err) {
        console.log(`Error: ${err}`) 
    }
}

datatest().then((res) => {
    console.log(res.nome) 
})

datatest2().then((res) => {
    //console.log(res)
})

//querydb.Close()