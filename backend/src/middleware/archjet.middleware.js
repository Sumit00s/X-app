import { aj } from "../config/arcjet.js";

export const arcjetMiddleware = async(req,res,next)=>{
    try{
        const decision = await aj.protect(req, { requested: 1 }); // Deduct 5 tokens from the bucket
        
        if (decision.isDenied()) {
            if (decision.reason.isRateLimit()) {
                return res.status(429).json({
                    error: "Too Many Requests",
                    message: "Rate Limit exceeded. Please try again later"
                });
            } 
            else if (decision.reason.isBot()) {
                return res.status(403).json({
                    error: "Bot access denied",
                    message: "Automated requests are not allowed."
                });
            } 
            else {
                return res.status(403).json({
                    error: "Forbidden",
                    message: "Access Denied by Security Policy"
                });
            }
        }

        if (decision.results.some((result)=> result.reason.isBot() && result.reason.isSpoofed())){
            return res.status(429).json({
                error: "Spoofed bit detedted",
                message: "Malicious bot actiity detedted."
            });
        }

        next();
    }
    catch(error){
        console.log("Arcjet middleware error:",error);
        next();
    }
}