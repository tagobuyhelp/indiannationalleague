const generateTnxId = () => {
    const randomNum = Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    
    return `MT${randomNum}`
}

const generateUserId = () => {
    const randomNum = Math.floor(100 + Math.random() * 900);
    
    return `MUID${randomNum}`
}



export { generateTnxId, generateUserId }



