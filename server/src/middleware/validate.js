export function validateBody(schema) {
  return (req, res, next) => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      const issue = result.error.issues[0];
      const message = issue ? `${issue.path.join('.')}: ${issue.message}` : 'Error de validación en el cuerpo de la solicitud';
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message,
          detalles: result.error.issues
        }
      });
    }
    req.validatedBody = result.data;
    next();
  };
}
