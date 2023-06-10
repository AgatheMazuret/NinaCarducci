(function($) {
  $.fn.mauGallery = function(options) {
    var options = $.extend({}, $.fn.mauGallery.defaults, options);
    var tagsCollection = [];
    return this.each(function() {
      // Créer un conteneur pour les lignes de la galerie
      $.fn.mauGallery.methods.createRowWrapper($(this));

       // Créer une lightbox si l'option est activée
      if (options.lightBox) {
        $.fn.mauGallery.methods.createLightBox(
          $(this),
          options.lightboxId,
          options.navigation
        );
      }

      // Attacher les écouteurs d'événements
      $.fn.mauGallery.listeners(options);

      // Parcourir chaque élément children de la galerie
      $(this)
        .children(".gallery-item")
        .each(function(index) {
          // Appliquer des modifications aux éléments d'image pour qu'ils s'adaptent de manière responsive
          $.fn.mauGallery.methods.responsiveImageItem($(this));
          
          // Déplacer l'élément dans le conteneur de ligne
          $.fn.mauGallery.methods.moveItemInRowWrapper($(this));
          
          // Envelopper l'élément dans une colonne en fonction du nombre de colonnes spécifié
          $.fn.mauGallery.methods.wrapItemInColumn($(this), options.columns);
          
          // Collecter les balises uniques si l'option showTags est activée
          var theTag = $(this).data("gallery-tag");
          if (
            options.showTags &&
            theTag !== undefined &&
            tagsCollection.indexOf(theTag) === -1
          ) {
            tagsCollection.push(theTag);
          }
        });

        // Afficher les balises si l'option showTags est activée
      if (options.showTags) {
        $.fn.mauGallery.methods.showItemTags(
          $(this),
          options.tagsPosition,
          tagsCollection
        );
      }

      // Afficher la galerie avec un effet de fondu
      $(this).fadeIn(500);
    });
  };

  // Options par défaut
  $.fn.mauGallery.defaults = {
    columns: 3,
    lightBox: true,
    lightboxId: null,
    showTags: true,
    tagsPosition: "bottom",
    navigation: true
  };

  // Écouteurs d'événements
  $.fn.mauGallery.listeners = function(options) {
    // Écouteur de clic sur les éléments de la galerie
    $(".gallery-item").on("click", function() {
      if (options.lightBox && $(this).prop("tagName") === "IMG") {
        $.fn.mauGallery.methods.openLightBox($(this), options.lightboxId);
      } else {
        return;
      }
    });

    // Écouteur de clic sur les liens de navigation des balises
    $(".gallery").on("click", ".nav-link", function() {
      $(".nav-link").removeClass("active");
      $(this).addClass("active");
      $.fn.mauGallery.methods.filterByTag();
    });

    // Écouteur de clic sur les liens de navigation des balises (appel direct à filterByTag)
    $(".gallery").on("click", ".nav-link", $.fn.mauGallery.methods.filterByTag);
    
    // Écouteur de clic sur le bouton précédent de la lightbox
    $(".gallery").on("click", ".mg-prev", function () {
        $.fn.mauGallery.methods.prevImage(options.lightboxId);
      });

      // Écouteur de clic sur le bouton suivant de la lightbox
    $(".gallery").on("click", ".mg-next", function() {
      $.fn.mauGallery.methods.nextImage(options.lightboxId)
    });
  };

  // Méthodes utilitaires
  $.fn.mauGallery.methods = {
  
    // Créer un conteneur de ligne pour les éléments de la galerie
    createRowWrapper(element) {
      if (
        !element
          .children()
          .first()
          .hasClass("row")
      ) {
        element.append('<div class="gallery-items-row row"></div>');
      }
    },

    // Envelopper un élément dans une colonne en fonction du nombre de colonnes spécifié
    wrapItemInColumn(element, columns) {
      if (columns.constructor === Number) {
        element.wrap(
          `<div class='item-column mb-4 col-${Math.ceil(12 / columns)}'></div>`
        );
      } else if (columns.constructor === Object) {
        var columnClasses = "";
        if (columns.xs) {
          columnClasses += ` col-${Math.ceil(12 / columns.xs)}`;
        }
        if (columns.sm) {
          columnClasses += ` col-sm-${Math.ceil(12 / columns.sm)}`;
        }
        if (columns.md) {
          columnClasses += ` col-md-${Math.ceil(12 / columns.md)}`;
        }
        if (columns.lg) {
          columnClasses += ` col-lg-${Math.ceil(12 / columns.lg)}`;
        }
        if (columns.xl) {
          columnClasses += ` col-xl-${Math.ceil(12 / columns.xl)}`;
        }
        element.wrap(`<div class='item-column mb-4${columnClasses}'></div>`);
      } else {
        console.error(
          `Columns should be defined as numbers or objects. ${typeof columns} is not supported.`
        );
      }
    },

    // Déplacer un élément dans le conteneur de ligne
    moveItemInRowWrapper(element) {
      element.appendTo(".gallery-items-row");
    },

    // Appliquer des modifications aux éléments d'image pour qu'ils s'adaptent de manière responsive
    responsiveImageItem(element) {
      if (element.prop("tagName") === "IMG") {
        element.addClass("img-fluid");
      }
    },

    // Ouvrir la lightbox avec l'image cliquée
    openLightBox(element, lightboxId) {
      $(`#${lightboxId}`)
        .find(".lightboxImage")
        .attr("src", element.attr("src"));
      $(`#${lightboxId}`).modal("toggle");
    },

    // Afficher l'image précédente dans la lightbox
    prevImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
        // Décrémenter l'index pour afficher l'image précédente 
          index = i -1;
        }
      });
      next =
        imagesCollection[index] ||
        imagesCollection[imagesCollection.length - 1];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    // Afficher l'image suivante dans la lightbox
    nextImage() {
      let activeImage = null;
      $("img.gallery-item").each(function() {
        if ($(this).attr("src") === $(".lightboxImage").attr("src")) {
          activeImage = $(this);
        }
      });
      let activeTag = $(".tags-bar span.active-tag").data("images-toggle");
      let imagesCollection = [];
      if (activeTag === "all") {
        $(".item-column").each(function() {
          if ($(this).children("img").length) {
            imagesCollection.push($(this).children("img"));
          }
        });
      } else {
        $(".item-column").each(function() {
          if (
            $(this)
              .children("img")
              .data("gallery-tag") === activeTag
          ) {
            imagesCollection.push($(this).children("img"));
          }
        });
      }
      let index = 0,
        next = null;

      $(imagesCollection).each(function(i) {
        if ($(activeImage).attr("src") === $(this).attr("src")) {
          // Incrémenter l'index pour afficher l'image suivante
          index = i +1;
        }
      });
      next = imagesCollection[index] || imagesCollection[0];
      $(".lightboxImage").attr("src", $(next).attr("src"));
    },

    // Créer la lightbox 
    createLightBox(gallery, lightboxId, navigation) {
      gallery.append(`<div class="modal fade" id="${
        lightboxId ? lightboxId : "galleryLightbox"
      }" tabindex="-1" role="dialog" aria-hidden="true">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-body">
                            ${
                              navigation
                                ? '<div class="mg-prev" style="cursor:pointer;position:absolute;top:50%;left:-15px;background:white;"><</div>'
                                : '<span style="display:none;" />'
                            }
                            <img class="lightboxImage img-fluid" alt="Contenu de l'image affichée dans la modale au clique"/>
                            ${
                              navigation
                                ? '<div class="mg-next" style="cursor:pointer;position:absolute;top:50%;right:-15px;background:white;}">></div>'
                                : '<span style="display:none;" />'
                            }
                        </div>
                    </div>
                </div>
            </div>`);
    },

    // Afficher les tags des éléments de la galerie
    showItemTags(gallery, position, tags) {
      var tagItems =
        '<li class="nav-item"><span class="nav-link active active-tag"  data-images-toggle="all">Tous</span></li>';
      $.each(tags, function(index, value) {
        tagItems += `<li class="nav-item active">
                <span class="nav-link"  data-images-toggle="${value}">${value}</span></li>`;
      });
      var tagsRow = `<ul class="my-4 tags-bar nav nav-pills">${tagItems}</ul>`;

      if (position === "bottom") {
        gallery.append(tagsRow);
      } else if (position === "top") {
        gallery.prepend(tagsRow);
      } else {
        console.error(`Unknown tags position: ${position}`);
      }
    },

    // Filtrer les éléments de la galerie par tag
    filterByTag() {
      if ($(this).hasClass("active-tag")) {
        return;
      }
      $(".active-tag").removeClass("active active-tag");
      $(this).addClass("active-tag");

      var tag = $(this).data("images-toggle");

      $(".gallery-item").each(function() {
        $(this)
          .parents(".item-column")
          .hide();
        if (tag === "all") {
          $(this)
            .parents(".item-column")
            .show(300);
        } else if ($(this).data("gallery-tag") === tag) {
          $(this)
            .parents(".item-column")
            .show(300);
        }
      });
    }
  };
})(jQuery);
