export const handleRequest = (req, res, securityInstance) => {
    securityInstance.executeMethod(req, res);
};