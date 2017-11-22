(function ($) {
  'use strict';

  var datasets = [];
  $('.dropdown.yamm-fw').each(function () {
    var title = $('.dropdown-toggle', $(this)).html();
    var links = $('.dropdown-menu li a', $(this));
    var suggestions = [];
    links.each(function () {
      suggestions.push({
        title: $(this).html(),
        link: $(this).attr('href')
      });
    });
    if (!suggestions.length) {
      return;
    }
    var engine = new Bloodhound({
      initialize: true,
      local: suggestions,
      identify: function (obj) {
        return obj.link;
      },
      datumTokenizer: Bloodhound.tokenizers.obj.whitespace('title'),
      queryTokenizer: Bloodhound.tokenizers.whitespace
    });
    datasets.push({
      display: 'title',
      source: engine,
      templates: {
        empty: function () {
          return [
            '<li><h3>',
            title,
            '</h3></li>',
            '<li>',
            window.translations['global-search']['nothing-found'],
            '</li>'
          ].join('');
        },
        header: function () {
          return [
            '<li><h3>',
            title,
            '</h3></li>'
          ].join('');
        },
        dataset: '<ul><ul>',
        suggestion: function (data) {
          return '<li><a href="' + data.link + '">' + data.title + '</a></li>';
        }
      }
    });
  });

  var list = $('.search-results-list:first');

  function initTypeahead(element) {
    var target;
    var searchInput = $('.search-input', element).typeahead({
      highlight: true,
      menu: $('.search-results .search-results-list', element),
      classNames: {
        suggestion: '',
        cursor: 'active'
      }
    }, datasets)
      .on('typeahead:selected', function (event, selection) {
        event.preventDefault();
        target = selection.link;
      })
      .on('typeahead:open', function () {
        $(this).closest('.global-search').addClass('focused');
      })
      .on('typeahead:close', function () {
        $(this).closest('.global-search').removeClass('focused');
        if ($(this).typeahead('val') !== $(this).val()) {
          $(this).val(null);
        }
      })
      .on('typeahead:cursorchange', function () {
        var active = $('div > .tt-selectable.active');
        var parentIndex = active.parent().index();
        var index = active.index();
        $('.search-results-list ul li').removeClass('active');
        list.next().children().eq(parentIndex).find('li').eq(index).addClass('active');
      })
      .on('keyup', function (event) {
        if (event.keyCode === 27) { // ESC
          $(this).closest('form').trigger('reset');
        } else if (event.key === 'Enter' && target) {
          window.location.replace(target);
        } else if ($(this).typeahead('val')) {
          $(this).closest('.global-search').addClass('has-input');
        } else {
          $(this).closest('.global-search').removeClass('has-input');
        }
      })
      .on('typeahead:render', function () {
        list.next().html(list.html());
        list.next().find('.tt-dataset').each(function () {
          $(this).replaceWith($('<ul>').addClass('tt-dataset').html($(this).html()));
        });
      });

    $('form', element)
      .on('submit', function () {
        return false;
      })
      .on('reset', function () {
        searchInput.blur().typeahead('val', '');
        $(this).closest('.global-search').removeClass('has-input');
      });

    $('.search-reset', element).on('click', function () {
      $(this).closest('form').trigger('reset');
      searchInput.focus();
    }).on('focus', function () {
      searchInput.addClass('focus');
    }).on('blur', function () {
      searchInput.removeClass('focus');
    }).on('keydown', function (evt) {
      if (evt.originalEvent.key === 'Enter') {
        $('.search-reset', element).click();
      }
    });
  }

  list.after($('<div>').addClass('search-results-list'));


  initTypeahead($('.global-search-standard'));
  initTypeahead($('.global-search-mobile'));

})(jQuery);
