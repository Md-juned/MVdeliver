export const validate = (schema) => {
  return (req, res, next) => {
    const data = { ...req.body, ...req.params, ...req.query };
    console.log("Validation data:", JSON.stringify(data, null, 2));
    
    const { error } = schema.validate(data, { abortEarly: false });

    if (error) {
      console.log("Validation errors:", error.details);
      const errorMessages = error.details.map((err) => {
        return `${err.path.join('.')}: ${err.message}`;
      }).join(", ");
      
      return res.json({ 
        status: false, 
        message: errorMessages || "Validation error" 
      });
    }

    next();
  };
};
