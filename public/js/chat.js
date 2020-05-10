const socket = io()
//elements
$inputForm = document.querySelector("#message-form")
$send =  document.querySelector('#send')
$sendLocation = document.querySelector("#location")
$FormInputmessage = document.querySelector("#input")
$messages = document.querySelector("#messages")


//templates
const locationTemplate = document.querySelector("#location-message-template").innerHTML
const messageTemplate = document.querySelector("#message-template").innerHTML
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML


//option

const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll = ()=>{
    // new message element
    const $newMessages = $messages.lastElementChild
    // height of new message
    const newMessagesStyles =  getComputedStyle($newMessages)
    const newMessageMargin = parseInt(newMessagesStyles.marginBottom )
    const newMessageHeight = $newMessages.offsetHeight + newMessageMargin
   
    //visible height
    const visibleheight= $messages.offsetHeight

    //Height of message
    const containerHeight  = $messages.scrollHeight

    //how far already scrolled

    const scrollOffSet  = $messages.scrollTop + visibleheight

    if(containerHeight - newMessageHeight<= scrollOffSet){
        $messages.scrollTop = $messages.scrollHeight

    }
}


socket.on("message", (message) => {
   
    const html = Mustache.render(messageTemplate,{
        username:message.username,
        message:message.text,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})


socket.on("locationMessage",(message)=>{
  
    const html = Mustache.render(locationTemplate,{
        username:message.username,
        url:message.url,
        createdAt:moment(message.createdAt).format("h:mm a")
    })
    $messages.insertAdjacentHTML("beforeend",html)
    autoscroll()
})

socket.on("roomData",({room,users})=>{
   const html = Mustache.render(sidebarTemplate,{
       users:users,
       room:room
   })
   document.querySelector("#sidebar").innerHTML = html
})

$send.addEventListener("click", (e) => {
    e.preventDefault()
    $send.setAttribute("disabled","disabled")
    
    socket.emit("sendMessage", $FormInputmessage.value,(error)=>{
       $send.removeAttribute("disabled")
       $FormInputmessage.value = "";
       $FormInputmessage.focus()
        
       if(error){
           return console.log(error)
       }

       
    })

})
$sendLocation.addEventListener("click", (e) => {
    e.preventDefault()
    if (!navigator.geolocation) {
        return alert("Your browser does not support this feature!")
    }
        $sendLocation.setAttribute("disabled","disabled")
    navigator.geolocation.getCurrentPosition((position) => {



        socket.emit("sendLocation", {
            lattitude: position.coords.latitude,
            longitude: position.coords.longitude
        },()=>{
            $sendLocation.removeAttribute("disabled")
       
           $FormInputmessage.focus()
        })
    })
})

socket.emit("join",{username,room},(error)=>{
    if(error){
        alert(error)
        location.href = "/"
    }
})