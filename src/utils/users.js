const Case  = require("case")
const users = []

const addUser=({id,username,room})=>{
  //validate
    if(!username || !room){
        return {
            error:"Username and Room are Required"
        }

    }
    // Clean the data
    
    username = Case.capital(username).trim()
    room = room.trim().toLowerCase()

  

  

    //check for existing user
    const existingUser = users.find((user)=>{
        return user.room === room && user.username === username
    })

    if(existingUser){
        return {
            error:"Username Already in use"
        }
    }

    //store user
    const user = {id,username,room}
    users.push(user)
    return { user }

}




const removeUser = (id)=>{
    const index  = users.findIndex((user)=>{
        return user.id === id
    })

    if(index !== -1){
        return users.splice(index,1)[0]
    }
}



const getUser = (id)=>{
   return  users.find((user)=> user.id === id)
   

}

const getUserInRoom  = (room)=>{
    room = room.trim().toLowerCase()
    return users.filter((user)=>user.room === room)
   
}

module.exports={
    addUser,
    removeUser,
    getUser,
    getUserInRoom
}
