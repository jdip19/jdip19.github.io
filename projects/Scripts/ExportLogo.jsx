var win = new Window("dialog", "Quick Export");

var replaceMode = null;

win.orientation = "column";
win.alignChildren = "left";

// PNG
var pngGroup = win.add("group");
var pngCheck = pngGroup.add("checkbox", undefined, "PNG");
pngCheck.value = true;

pngGroup.add("statictext", undefined, "Width:");
var pngWidth = pngGroup.add("edittext", undefined, "3000");
pngWidth.characters = 6;
pngGroup.add("statictext", undefined, "px");

// SVG
var svgCheck = win.add("checkbox", undefined, "SVG");
svgCheck.value = true;

// PDF
var pdfCheck = win.add("checkbox", undefined, "PDF");
pdfCheck.value = true;

// Buttons
var btns = win.add("group");
var exportBtn = btns.add("button", undefined, "Export");
btns.add("button", undefined, "Cancel");

exportBtn.onClick = function () {
  var doc = app.activeDocument;

  if (doc.selection.length == 0) {
    alert("Select objects or groups to export.");
    return;
  }

  var targetWidth = Number(pngWidth.text);
  if (isNaN(targetWidth) || targetWidth <= 0) targetWidth = 3000;

  var docName = doc.name.replace(/\.[^\.]+$/, "");
  var base = new Folder(doc.path + "/" + docName + "_logo");

  if (!base.exists) base.create();

  var pngFolder = new Folder(base.fsName + "/PNG");
  var svgFolder = new Folder(base.fsName + "/SVG");
  var pdfFolder = new Folder(base.fsName + "/PDF");

  if (pngCheck.value && !pngFolder.exists) pngFolder.create();
  if (svgCheck.value && !svgFolder.exists) svgFolder.create();
  if (pdfCheck.value && !pdfFolder.exists) pdfFolder.create();

  var sel = doc.selection;

  for (var i = 0; i < sel.length; i++) {
    var item = sel[i];
    var name = item.name;
    if (!name || name == "") name = "asset_" + (i + 1);

    // create temp document
    var temp = app.documents.add(DocumentColorSpace.RGB);

    var dup = item.duplicate(temp, ElementPlacement.PLACEATBEGINNING);

    temp.selection = null;
    dup.selected = true;

    // get bounds
    var b = dup.visibleBounds;

    var left = b[0];
    var top = b[1];
    var right = b[2];
    var bottom = b[3];

    var width = right - left;
    var height = top - bottom;

    // move object to origin
    dup.left = 0;
    dup.top = height;

    // resize artboard to object
    temp.artboards[0].artboardRect = [0, height, width, 0];

    // recalc bounds
    var scale = (targetWidth / width) * 100;

    // PNG export
    if (pngCheck.value) {
      var pngFile = new File(pngFolder + "/" + name + ".png");

      var pngOpt = new ExportOptionsPNG24();
      pngOpt.transparency = true;
      pngOpt.artBoardClipping = true;
      pngOpt.horizontalScale = scale;
      pngOpt.verticalScale = scale;

      if (checkFile(pngFile)) {
        temp.exportFile(pngFile, ExportType.PNG24, pngOpt);
      }
    }

    // SVG export
    if (svgCheck.value) {
      var svgFile = new File(svgFolder + "/" + name + ".svg");

      var svgOpt = new ExportOptionsSVG();
      svgOpt.embedRasterImages = true;
      svgOpt.fontSubsetting = SVGFontSubsetting.GLYPHSUSED;

      if (checkFile(svgFile)) {
        temp.exportFile(svgFile, ExportType.SVG, svgOpt);
      }
    }

    // PDF export
    if (pdfCheck.value) {
      var pdfFile = new File(pdfFolder + "/" + name + ".pdf");

      var pdfOpt = new PDFSaveOptions();

      if (checkFile(pdfFile)) {
        temp.saveAs(pdfFile, pdfOpt);
      }
    }

    temp.close(SaveOptions.DONOTSAVECHANGES);
  }

  alert(sel.length +" items exported in logo structure.");

  win.close();
};

win.show();

function checkFile(file) {
  if (!file.exists) return true;

  if (replaceMode == "replaceAll") {
    file.remove();
    return true;
  }

  if (replaceMode == "skipAll") {
    return false;
  }

  var dialog = new Window("dialog", "File Exists");

  dialog.orientation = "column";
  dialog.alignChildren = "fill";

  dialog.add("statictext", undefined, "File already exists:");
  dialog.add("statictext", undefined, file.name);

  var btns = dialog.add("group");

  var replaceBtn = btns.add("button", undefined, "Replace All");
  var skipBtn = btns.add("button", undefined, "Skip Existing");
  var cancelBtn = btns.add("button", undefined, "Cancel Export");

  var result = null;

  replaceBtn.onClick = function () {
    replaceMode = "replaceAll";
    result = true;
    dialog.close();
  };

  skipBtn.onClick = function () {
    replaceMode = "skipAll";
    result = false;
    dialog.close();
  };

  cancelBtn.onClick = function () {
    throw new Error("Export cancelled by user.");
  };

  dialog.show();

  if (replaceMode == "replaceAll") {
    file.remove();
    return true;
  }

  return result;
}
