const bcrypt = require('bcrypt-nodejs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const M = require('./utils/Moi')

const schema = new mongoose.Schema(M.translate({
  id: M.number().required(),
  title: M.string().required(),
  user: M.string().required(),
  version: M.string(),
  content: M.string(),
  tags: [M.string()],
  type: M.string(),
  url: M.string(),
  date_submit: M.date().required(),
  date_edit: M.date(),
  votes: M.number().required(),
  vote_up_users: [M.string()],
  vote_down_users: [M.string()],
  answers: [M.number()],
  answer_vote: M.number(),
  comments_length: M.number(),
  comments: [
    {
      id: M.string(),
      parent: M.number(),
      username: M.string(),
      votes: M.number(),
      vote_up_users: [M.string()],
      vote_down_users: [M.string()],
      date_submit: M.date(),
      content: M.string(),
    }
  ],
}), { timestamps: true });


schema.statics.getHighestId = function(){
    return this.collection.find({},{id: 1}).sort({id: -1}).limit(1).toArray()
    .then( docs => docs.length === 0 ? 1 : docs[0].id )
    .catch( (err) => Promise.reject(err) )
}

schema.statics.fancyInsert = function(doc){
    doc.id = 0
    var err = doc.validateSync()
    if(err) return Promise.reject(err)

    var tryCount = 0
    var self = this
    function optimisticallyInsert(){
        return self.getHighestId()
        .then( id => {
            doc.id = id + 1
            return self.collection.insert(doc).then( () => doc.id )
        })
        .catch( e => {
            if(e.code == 11000){
                return tryCount++ > 10 ?
                    Promise.reject('failed attempts count exceeded maximum 10.') :
                    optimisticallyInsert(doc)
            }
            else{
                return Promise.reject(e)
            }
        })
    }

    return optimisticallyInsert()

}


schema.statics.voteUp = function( questionId ){


    return this.findOne( {id: questionId}, {vote_up_users: true})
    .then( doc => {

        if( doc === null){
            throw('ARTICLE_NOT_FOUND')
        }

        var user = 'zzz'
        var vote_twice = doc.vote_up_users.indexOf(user) != -1

        if ( vote_twice ){
            throw('VOTE_TWICE')
        }

        doc.vote_up_users.push( 'userfoo' )
        doc.votes =  doc.vote_up_users.length

        return this.update({ _id: doc._id}, {$set: {
            vote_up_users: doc.vote_up_users,
            votes: doc.votes,
        }})

    })

}


var Question = mongoose.model('Question', schema)

Question.collection.createIndex( {id: 1}, {unique: true})

module.exports = Question

//todos: need to check board exist before save
