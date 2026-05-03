module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version');

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    const { phone, amount } = req.body;
    
    // Simulate B2C Success
    res.status(200).json({ 
        success: true, 
        data: {
            ConversationID: "V_" + Math.random().toString(36).substring(7),
            ResponseDescription: "Accept the service request successfully."
        } 
    });
};
