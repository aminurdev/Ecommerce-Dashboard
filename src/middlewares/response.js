export const responseEnhancer = (req, res, next) => {
  res.ok = (data) => res.status(200).json({ data });
  next();
};
