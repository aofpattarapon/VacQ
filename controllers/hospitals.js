const Hospital = require("../models/Hospital");

exports.getHospitals = async (req, res, next) => {
  try {
    const reqQuery = { ...req.query };
    const removeFields = ["select", "sort", "page", "limit"];
    removeFields.forEach((param) => delete reqQuery[param]);

    let queryStr = JSON.stringify(req.query);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, (match) => `$${match}`);
    let query = Hospital.find(JSON.parse(queryStr)).populate("appointments");

    // Select field
    if (req.query.select) {
      const fields = req.query.select.split(",").join(" ");
      query = query.select(fields);
    }

    // Sort
    if (req.query.sort) {
      const sortBy = req.query.sort.split(",").join(" ");
      query = query.sort(sortBy);
    } else {
      query = query.sort("-createdAt");
    }

    // Pagination
    const page = parseInt(req.query.page, 10) ?? 1;
    const limit = parseInt(req.query.limit, 10) ?? 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await Hospital.countDocuments();

    // Execute query
    query = query.skip(startIndex).limit(limit);

    // Pagination result
    const pagination = {};

    if (endIndex < total) {
      pagination.next = {
        page: page + 1,
        limit: limit,
      };
    }

    if (startIndex > 0) {
      pagination.prev = {
        page: page - 1,
        limit: limit,
      };
    }

    const hospitals = await query;

    if (!hospitals || hospitals.length === 0) {
      res.status(404).json({ success: false, message: "not found" });
    }
    res.status(200).json({ success: true, count: hospitals.length, pagination: pagination, data: hospitals });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

exports.getHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

exports.createHospital = async (req, res, next) => {
  const hospital = await Hospital.create(req.body);
  res.status(200).json({ success: true, data: hospital });
};

exports.updateHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!hospital) {
      return res.status(400).json({ success: false, data: hospital });
    }
    res.status(200).json({ success: true, data: hospital });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};

exports.deleteHospital = async (req, res, next) => {
  try {
    const hospital = await Hospital.findById(req.params.id);
    if (!hospital) {
      return res.status(400).json({ success: false, message: "Not found" });
    }
    hospital.remove();
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(400).json({ success: false, message: err });
  }
};
