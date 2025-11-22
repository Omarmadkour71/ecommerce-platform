const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("../utils/apiFeatures");

/* exports.getAllDocs = (Model) =>
  catchAsync(async (req, res, next) => {
    // Show incoming query params
    console.log("--- getAllDocs debug start ---");
    console.log("req.query:", req.query);

    // quick sanity: collection count
    const totalDocs = await Model.countDocuments();
    console.log("total documents in collection:", totalDocs);

    // Build features and inspect the Mongoose query BEFORE execution
    const features = new APIFeatures(Model.find(), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    // Inspect the built Mongo filter and options
    try {
      // Mongoose Query exposes the internal filter via getQuery() and options via getOptions()
      const builtFilter = features.query.getQuery
        ? features.query.getQuery()
        : {};
      const builtOptions = features.query.getOptions
        ? features.query.getOptions()
        : {};
      console.log("built Mongo filter:", builtFilter);
      console.log("built options:", builtOptions);
    } catch (err) {
      console.log("could not inspect query internals:", err);
    }

    // Execute
    const docs = await features.query;
    console.log(
      "docs returned length:",
      Array.isArray(docs) ? docs.length : "not array"
    );

    console.log("--- getAllDocs debug end ---");

    // Normal response
    res.status(200).json({
      status: "success",
      results: Array.isArray(docs) ? docs.length : 0,
      data: { docs },
    });
  }); */

exports.getAllDocs = (Model) =>
  catchAsync(async (req, res, next) => {
    let filteredObj = {};
    const filterFeatures = new APIFeatures(Model.find(filteredObj), req.query)
      .filter()
      .sort()
      .limitField()
      .paginate();

    const docs = await filterFeatures.query;

    if (!docs) {
      return next(new AppError("No Results Founds! please try Again", 404));
    }
    res.status(200).json({
      status: "Success",
      length: docs.length,
      Date: {
        docs,
      },
    });
  });

exports.createDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);
    res.status(201).json({
      status: "Success",
      Date: {
        doc,
      },
    });
  });

exports.getDoc = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError("Invalid Id!", 404));
    }

    res.status(200).json({
      status: "Success",
      Date: {
        doc,
      },
    });
  });

exports.updateDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError("Invalid Id", 404));
    }

    res.status(200).json({
      status: "Success",
      Date: {
        doc,
      },
    });
  });

exports.deleteDoc = (Model) =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return next(new AppError("Invalid Id", 404));
    }

    res.status(204).json({
      status: "Success",
      Data: null,
    });
  });
