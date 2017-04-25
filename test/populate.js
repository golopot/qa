const data = require('./sodata.json')
const host = 'http://localhost:9090'
const fetch = require('node-fetch')
console.log(data.items[1])
function populate(){

    for(let entry of data.items){
        var {title, tags} = entry
        var user = entry.owner.display_name
        var content = '--'
        fetch(host + '/api/submit-question', {
            method: 'post',
            headers: {'content-type': 'application/json'},
            body: JSON.stringify({
                title,
                content,
                tags,
                user,
            })
        })
        .then( x => console.log(x))
        .catch( e => console.log(e))
    }

}

function clean(){

}


populate()
