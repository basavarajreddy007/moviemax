const Brand = require("../models/Brand");
const createSlug = require("../utils/slugify");

const getBrands = async (req, res, next) => {
  try {
    const { all } = req.query;
    const filter = all ? {} : { isActive: true };
    const brands = await Brand.find(filter).sort({ name: 1 });
    res.status(200).json({ success: true, data: brands });
  } catch (error) {
    next(error);
  }
};

const getBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findById(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.status(200).json({ success: true, data: brand });
  } catch (error) {
    next(error);
  }
};

const createBrand = async (req, res, next) => {
  try {
    const data = req.body;
    data.slug = createSlug(data.name);
    const brand = await Brand.create(data);
    res.status(201).json({ success: true, message: "Brand created", data: brand });
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.status(200).json({ success: true, message: "Brand updated", data: brand });
  } catch (error) {
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) return res.status(404).json({ success: false, message: "Brand not found" });
    res.status(200).json({ success: true, message: "Brand deleted" });
  } catch (error) {
    next(error);
  }
};

module.exports = { getBrands, getBrand, createBrand, updateBrand, deleteBrand };
