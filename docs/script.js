$(function () {
    var demoData = {
            normal: {
                x: -495,
                y: -5,
                w: 33,
                h: 31
            },
            retina: {
                x: -269,
                y: -3,
                w: 33,
                h: 31
            }
        },
        classNameMove = "cursor-move",
        classNameSelected = "is-selected",
        classNameIsRetina = "is-retina",
        classNameCopied = "copied",
        $body = $(document.body),
        $spriteUrl = $("#spriteUrl"),
        $spriteW = $("#spriteW"),
        $spriteH = $("#spriteH"),
        $pieceX = $(".piece-x"),
        $pieceY = $(".piece-y"),
        $pieceW = $(".piece-w"),
        $pieceH = $(".piece-h"),
        $wrapper = $(".sprite--wrapper"),
        $image = $(".sprite--image"),
        $spritePieces = $(".sprite-piece"),
        $spriteResize = $(".sprite-resize"),
        $textareaGeneratedCss = $("#textareaGeneratedCss"),
        $previewBoxes = $(".sprite--preview"),
        $previewNormal = $(".preview--normal"),
        $previewRetina = $(".preview--retina"),
        px = "px",
        transBgDim = 20,
        shouldRetinaSelected = false,
        debugWhoIs = false,
        changePos = false,
        resizePiece = false,
        disableKeys = false,
        cssData = {},
        startPos;

    function isRetinaSelected() {
        return $previewRetina.hasClass(classNameSelected);
    }

    function $el(elementName, returnRetina) {
        var _$el_;
        if (isRetinaSelected() && returnRetina === undefined || returnRetina) {
            _$el_ = eval(elementName).filter("." + classNameIsRetina);
        } else {
            _$el_ = eval(elementName).not("." + classNameIsRetina);
        }
        return _$el_;
    }

    function getQueryParams() {
        var qs = location.hash.split("+").join(" "),
            params = {},
            tokens,
            re = /[#&]?([^=]+)=([^&]*)/g;

        while (tokens = re.exec(qs)) {
            params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2]);
        }

        return params;
    }

    function setCss() {
        var params = getQueryParams(),
            $spriteImg = $(new Image()),
            css;

        if ($spriteUrl.val()) {
            params.spriteImage = $spriteUrl.val();
        }

        css = "\
            .sprite.sprite--image,\
            .sprite.sprite--preview {\
                background-image: url(" + params.spriteImage + "), url(trans-bg.jpg);\
            }\
        ";

        $spriteImg
            .on("load", function () {
                $spriteW.val($spriteImg[0].naturalWidth);
                $spriteH.val($spriteImg[0].naturalHeight);

                spriteLoaded();
            })
            .attr("src", params.spriteImage);

        $("#spriteCss").remove();
        $("head").append("<style id='spriteCss'>" + css + "</style>");
        // set selected
        if (!shouldRetinaSelected) {
            $previewNormal.addClass(classNameSelected);
        } else {
            $previewRetina.addClass(classNameSelected);
        }
        $el("$spritePieces").addClass(classNameSelected);
    }

    function spriteLoaded() {
        var css = {
            width: $spriteW.val(),
            height: $spriteH.val()
        };
        $wrapper.css(css);
        $image.css(css);

        updatePiece("init", {forceUpdate: true, updatePreviewPiece: true});
    }

    function switchToPreview($element) {
        var hasClass = $($element).hasClass(classNameIsRetina),
            hasParentClass = $($element).parent().hasClass(classNameIsRetina);

        if (hasClass || hasParentClass) {
            selectPreview($previewRetina);
        } else {
            selectPreview($previewNormal);
        }
    }

    function selectPreview(element) {
        $previewBoxes.removeClass(classNameSelected);
        $spritePieces.removeClass(classNameSelected);
        $(element).addClass(classNameSelected);
        $el("$spritePieces").addClass(classNameSelected);
    }

    function setEventHandler() {
        // set size to sprte and click handler for x,y position
        $image.click(function (event) {
            var newX = event.offsetX,
                newY = event.offsetY;

            if (isRetinaSelected()) {
                newX = Math.round(newX / 2);
                newY = Math.round(newY / 2);
            }

            $el("$pieceX").val(-(newX));
            $el("$pieceY").val(-(newY));

            updatePiece("$image.click", {
                updatePreviewPiece: true
            });
        });
        // witch between the normal and retina mask
        $previewBoxes.click(function () {
            selectPreview(this);
            var pos = $(this).css("backgroundPosition"),
                reg = /([-.0-9].*)px ([-.0-9].*)px, /g,
                matches = new RegExp(reg).exec(pos);
            $el("$pieceX").val(matches[1] || 0);
            $el("$pieceY").val(matches[2] || 0);
            $el("$pieceW").val($(this).outerWidth());
            $el("$pieceH").val($(this).outerHeight());
        });

        // event for inputs
        $pieceX.add($pieceY).add($pieceW).add($pieceH)
            .click(function () {
                switchToPreview(this);
            }).change(function () {
                updatePiece("change on inputs", {
                    updatePreviewPiece: true
                });
            });

        $spritePieces.mousedown(function (event) {
            switchToPreview(this);
            if (resizePiece) {
                return false;
            }
            changePos = true;
            startPos = {
                x: -(parseInt($el("$spritePieces").css("left"))),
                y: -(parseInt($el("$spritePieces").css("top"))),
                client: {
                    x: event.clientX,
                    y: event.clientY
                }
            };
        }).mouseup(function () {
            changePos = false;
            $body.removeClass(classNameMove);
        });

        $spriteResize.mousedown(function (event) {
            switchToPreview(this);
            resizePiece = true;
            startPos = {
                w: parseInt($el("$spritePieces").width()),
                h: parseInt($el("$spritePieces").height()),
                client: {
                    x: event.clientX,
                    y: event.clientY
                }
            };
        });

        $wrapper.mouseenter(function () {
            disableKeys = true;
        }).mouseleave(function () {
            disableKeys = false;
        });

        var updatePieceDebounced;

        window.setTimeout(function () {
            updatePieceDebounced = _.debounce(function () {
                var newW = $el("$spritePieces").width(),
                    newH = $el("$spritePieces").height();

                if (isRetinaSelected()) {
                    newW = Math.round(newW / 2);
                    newH = Math.round(newH / 2);
                }

                $el("$pieceW").val(newW);
                $el("$pieceH").val(newH);

                updatePiece("updatePieceDebounced");
            }, 150)
        }, 1000);

        // body drag an drop inside the mask
        $body.mousemove(function (event) {
            if (changePos) {
                var diffX = (startPos.client.x - event.clientX),
                    diffY = (startPos.client.y - event.clientY),
                    thisX = Math.round(startPos.x + diffX),
                    thisY = Math.round(startPos.y + diffY);

                stayPreviewInBounds(thisX, thisY);
                stayPiecesInBounds(thisX, thisY);

                updatePiece("body.mousemove");
            }
            if (resizePiece) {
                var diffX = (startPos.client.x - event.clientX),
                    diffY = (startPos.client.y - event.clientY),
                    newW = Math.round(startPos.w - diffX),
                    newH = Math.round(startPos.h - diffY);

                $el("$spritePieces").css({
                    width: newW,
                    height: newH
                });
            }
        }).mouseup(function () {
            if (changePos) {
                $spritePieces
                    .trigger("mouseup");
            }
            if (resizePiece) {
                updatePieceDebounced();
                resizePiece = false;
            }
        }).keydown(function (event) {
            if (disableKeys) {
                var keys = {left: 37, right: 39, up: 38, down: 40},
                    keyCode = event.keyCode;
                switch (keyCode) {
                    case keys.left:
                        $el("$pieceX").val(parseInt($el("$pieceX").val()) + 1);
                        break;
                    case keys.right:
                        $el("$pieceX").val(parseInt($el("$pieceX").val()) - 1);
                        break;
                    case keys.up:
                        $el("$pieceY").val(parseInt($el("$pieceY").val()) + 1);
                        break;
                    case keys.down:
                        $el("$pieceY").val(parseInt($el("$pieceY").val()) - 1);
                        break;
                }

                if (_.values(keys).indexOf(keyCode) >= 0) {
                    event.preventDefault();
                    updatePiece("keydown arrows", {updatePreviewPiece: true});
                }
            }
        });

        $spriteUrl.change(_.debounce(function () {
            setCss();
            setPreviewData();
        }, 150));

        $textareaGeneratedCss.click(copyCss);
    }

    function stayPreviewInBounds(thisX, thisY) {
        var newX = thisX,
            newY = thisY,
            spriteW = -(parseInt($spriteW.val())),
            spriteH = -(parseInt($spriteH.val())),
            pieceW = parseInt($el("$pieceW").val()),
            pieceH = parseInt($el("$pieceH").val());

        if (isRetinaSelected()) {
            pieceW = pieceW * 2;
            pieceH = pieceH * 2;
        }

        if (newX >= 0) {
            newX = 0;
        } else if ((newX - pieceW) < spriteW) {
            newX = spriteW + pieceW;
        }

        if (newY >= 0) {
            newY = 0;
        } else if ((newY - pieceH) < spriteH) {
            newY = spriteH + pieceH;
        }

        if (isRetinaSelected()) {
            newX = Math.round(newX / 2);
            newY = Math.round(newY / 2);
        }

        $el("$pieceX").val(newX);
        $el("$pieceY").val(newY);
    }

    function stayPiecesInBounds(thisX, thisY) {
        var newX = parseInt(-(thisX)),
            newY = parseInt(-(thisY)),
            spriteW = parseInt($spriteW.val()),
            spriteH = parseInt($spriteH.val()),
            pieceCss;

        if (newX <= 0) {
            newX = 0;
        } else if ((newX + $el("$spritePieces").width()) > spriteW) {
            newX = spriteW - $el("$spritePieces").width();
        }

        if (newY <= 0) {
            newY = 0;
        } else if ((newY + $el("$spritePieces").height()) > spriteH) {
            newY = spriteH - $el("$spritePieces").height();
        }

        pieceCss = {
            left: newX,
            top: newY
        };

        $el("$spritePieces").css(pieceCss);
    }

    function updatePiece(whoIs, options) {
        if (debugWhoIs) {
            console.log("updatePiece", whoIs);
        }
        var transBgPos = ", 0 0",
            transBgSize = ", " + transBgDim + px + " " + transBgDim + px,
            css, retinaCSS, previewCss, previewRetinaCss,
            options = options || {};
        if (!isRetinaSelected() || options.forceUpdate) {
            css = {
                backgroundPosition: $el("$pieceX", false).val() + px + " " + $el("$pieceY", false).val() + px + transBgPos,
                backgroundSize: $spriteW.val() + px + " " + $spriteH.val() + px + transBgSize,
                width: parseInt($el("$pieceW", false).val()),
                height: parseInt($el("$pieceH", false).val())
            };
            previewCss = {
                top: -(parseInt($el("$pieceY", false).val())),
                left: -(parseInt($el("$pieceX", false).val())),
                width: parseInt($el("$pieceW", false).val()),
                height: parseInt($el("$pieceH", false).val())
            };
            cssData.normal = {
                left: parseInt($el("$pieceX", false).val()),
                top: parseInt($el("$pieceY", false).val()),
                sizeW: parseInt($spriteW.val()),
                sizeH: parseInt($spriteH.val()),
                width: css.width,
                height: css.height
            };
            $previewNormal.css(css);
            if (options.updatePreviewPiece) {
                $el("$spritePieces", false).css(previewCss);
            }
        }
        if (isRetinaSelected() || options.forceUpdate) {
            var newX = parseInt($el("$pieceX", true).val()),
                newY = parseInt($el("$pieceY", true).val());
            retinaCSS = {
                backgroundPosition: newX + px + " " + newY + px + transBgPos,
                backgroundSize: ($spriteW.val() / 2) + px + " " + ($spriteH.val() / 2) + px + transBgSize,
                width: parseInt($el("$pieceW", true).val()),
                height: parseInt($el("$pieceH", true).val())
            };
            previewRetinaCss = {
                top: -(parseInt($el("$pieceY", true).val()) * 2),
                left: -(parseInt($el("$pieceX", true).val()) * 2),
                width: parseInt($el("$pieceW", true).val()) * 2,
                height: parseInt($el("$pieceH", true).val()) * 2
            };
            cssData.retina = {
                left: newX,
                top: newY,
                sizeW: ($spriteW.val() / 2),
                sizeH: ($spriteH.val() / 2),
                width: retinaCSS.width,
                height: retinaCSS.height
            };
            $previewRetina.css(retinaCSS);
            if (options.updatePreviewPiece) {
                $el("$spritePieces", true).css(previewRetinaCss);
            }
        }

        if (whoIs === "init" && debugWhoIs) {
            console.log("css", css, "retinaCSS", retinaCSS);
            console.log("previewCss", previewCss, "previewRetinaCss", previewRetinaCss);
        }

        generateCss();
    }

    function setPreviewData(coords, update) {
        if (!coords) {
            coords = {normal: {x: 0, y: 0, h: 0, w: 0}, retina: {x: 0, y: 0, h: 0, w: 0}};
        }

        $el("$pieceX", false).val(coords.normal.x);
        $el("$pieceY", false).val(coords.normal.y);
        $el("$pieceW", false).val(coords.normal.w);
        $el("$pieceH", false).val(coords.normal.h);

        $el("$pieceX", true).val(coords.retina.x);
        $el("$pieceY", true).val(coords.retina.y);
        $el("$pieceW", true).val(coords.retina.w);
        $el("$pieceH", true).val(coords.retina.h);

        if (update) {
            updatePiece("setPreviewData", {forceUpdate: true, updatePreviewPiece: true});
        }
    }

    var cssGeneratedTpl = "" +
        ".sprite {\n" +
        "   background-url: \"{0}\";\n" +
        "   background-size: {1} {2};\n" +
        "   background-repeat: no-repeat;\n" +
        "}\n" +
        ".sprite--piece-normal {\n" +
        "   background-position: {3} {4};\n" +
        "   width: {5};\n" +
        "   height: {6};\n" +
        "}\n" +
        ".sprite--piece-retina {\n" +
        "   background-position: {7} {8};\n" +
        "   background-size: {9} {10};\n" +
        "   width: {11};\n" +
        "   height: {12};\n" +
        "}\n" +
        "";

    function generateCss() {
        if (cssData.normal && cssData.retina) {
            var generatedTpl = format(cssGeneratedTpl, [
                $spriteUrl.val(), cssData.normal.sizeW, cssData.normal.sizeH,
                cssData.normal.left, cssData.normal.top, cssData.normal.width, cssData.normal.height,
                cssData.retina.left, cssData.retina.top, cssData.retina.sizeW, cssData.retina.sizeH, cssData.retina.width, cssData.retina.height
            ]);
            $textareaGeneratedCss.val(generatedTpl);
        }
    }

    function format(source, params) {
        $.each(params, function (i, n) {
            source = source.replace(new RegExp("\\{" + i + "\\}", "g"), n + (typeof n === "number" && n !== 0 ? px : ""));
        });
        return source;
    }

    function copyCss() {
        $textareaGeneratedCss[0].select();
        try {
            var successful = document.execCommand("copy"),
                msg = successful ? "successful" : "unsuccessful";
            console.log("Copying text command was " + msg + " / " + $textareaGeneratedCss.val());
            $textareaGeneratedCss.addClass(classNameCopied);
        } catch (err) {
            console.log("Oops, unable to copy");
        }

        clearSelection();
    }

    function clearSelection() {
        if (document.selection) {
            document.selection.empty();
        } else if (window.getSelection) {
            window.getSelection().removeAllRanges();
        }
        window.setTimeout(function () {
            $textareaGeneratedCss.removeClass(classNameCopied);
        }, 350);
    }

    setPreviewData(demoData);
    setEventHandler();
    setCss();
});