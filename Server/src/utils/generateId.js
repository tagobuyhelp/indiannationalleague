const generateTnxId = () => {
    const randomNum = Math.floor(1000000000000000 + Math.random() * 9000000000000000);
    
    return `TX${randomNum}`
}

const generateUserId = () => {
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    
    return `INLID${randomNum}`
}



export { generateTnxId, generateUserId }



