$(document).ready(function() {
  var query = parse_url_params();
  window.query = query;

  let boxes = [];
  boxes.push({
    id: 'i-am-a-child-of-god',
    image_url: 'https://www.lds.org/bc/content/shared/content/images/gospel-library/magazine/fr09jan41_color.jpg',
    song_title: 'I am a child of God',
    music_url: 'http://broadcast.lds.org/churchmusic/MP3/1/2/words/2.mp3?download=true'
  });
  boxes.push({
    id: 'my-heavenly-father-loves-me',
    image_url: 'https://easter-fun.info/wp-content/uploads/04/lds-easter-message-2018-easter-lily-1024x1024.jpg',
    song_title: 'My Heavenly Father loves me',
    music_url: 'http://broadcast.lds.org/churchmusic/MP3/1/2/words/228.mp3?download=true'
  });
  boxes.push({
    id: 'when-i-am-baptized',
    image_url: 'https://media.ldscdn.org/images/media-library/gospel-art/gospel-in-action/baptism-lds-593669-gallery.jpg',
    song_title: 'Baptism',
    music_url: 'http://broadcast.lds.org/churchmusic/MP3/1/2/words/100.mp3?=true'
  });
  boxes.push({
    id: 'families-can-be-together-forever',
    image_url: 'https://www.lds.org/bc/content/ldsorg/church/news/2014/2/3/300%20family%20at%20temple.jpg',
    song_title: 'Families can be together forever',
    music_url: 'http://broadcast.lds.org/churchmusic/MP3/1/2/words/188.mp3?download=true'
  });
  boxes.push({
    id: 'a-childs-prayer',
    image_url: 'https://media.ldscdn.org/images/media-library/prayer/young-man-in-fiji-praying-268645-gallery.jpg',
    song_title: "A Child's Prayer",
    music_url: 'http://broadcast.lds.org/churchmusic/MP3/1/2/words/12.mp3?download=true'
  });
  boxes.push({
    id: 'if-the-savior-stood-beside-me',
    image_url: 'https://media.ldscdn.org/images/media-library/gospel-art/gospel-in-action/jesus-children-37775-gallery.jpg',
    song_title: "If the Savior Stood Beside Me",
    music_url: 'http://broadcast.lds.org/churchmusic/Primary/PR_IfTheSavior_eng.mp3?download=true'
  });

  for (let i in boxes) {
    let box = boxes[i];
    let div = $(`<div class=songbox id=${box.id} />`);
    let img = $(`<img src="${box.image_url}"></img>`);
    div.append(img);
    div.append(`<h3 style="flex-grow:1">${box.song_title}</h3>`);
    let controls = $('<div class=controls />');
    div.append(controls);

    controls.append('<p>You listened to this song <span class=count>[0]</span> times.<br><!--- <a id=add href="#">add</a> / <a id=subtract href="#">subtract</a> / <a id=reset href="#">reset</a> ---></p>');
    controls.append(`<audio controls><source src="${box.music_url}" /></audio>`);
    $('.songboxes').append(div);
    setup_box(box, div);
  }


  {
    let div=$(`<div class=songbox />`);
    div.append(`<h3>Unlocked scriptures</h3>`);
    let ul=$('<ul />');
    ul.append('<li>1. <span class=scripture id=scripture1></span></li>');
    ul.append('<li>2. <span class=scripture id=scripture2></span></li>');
    ul.append('<li>3. <span class=scripture id=scripture3></span></li>');
    div.append(ul);
    $('.songboxes').append(div);
  }

  function update_unlocked_scriptures() {
    let min_count=99999;
    for (let i in boxes) {
      let box=boxes[i];
      let count=get_count(box.id)||0;
      if (count<min_count)
        min_count=count;
    }
    console.info('min_count: '+min_count);
    if (min_count>=1) {
      $('#scripture1').html('... the song of the righteous is a prayer unto me... D&C 25:12');
    }
    if (min_count>=2) {
      $('#scripture2').html('... little children are alive in Christ, even from the foundation of the world... Moroni 8:12');
    }
    if (min_count>=3) {
      $('#scripture3').html('... But Jesus said, Suffer little children, and forbid them not, to come unto me: for of such is the kingdom of heaven.... Matthew 19:14');
    }
  }
  update_unlocked_scriptures();


  $("audio").on("play", function() {
    $("audio").not(this).each(function(index, audio) {
      audio.pause();
    });
  });

  if (!localStorage.browser_id) {
    localStorage.browser_id = make_random_id(10);
  }

  $('#report_back').click(on_report_back);

  function on_report_back() {
    let obj = {
      browser_id: localStorage.browser_id,
      record: get_record()
    };
    $.ajax({
      type: "POST",
      url: "/set/record",
      data: JSON.stringify(obj),
      contentType: "application/json; charset=utf-8",
      dataType: "json",
      success: function(resp) {
        if (!resp.success) {
          show_status('warning', 'Error reporting data: ' + resp.error);
          return;
        }
        show_status('success', 'Nice job! Keep listening.');
        update_unlocked_scriptures();
      },
      error: function(jqXHR, textStatus, err) {
        show_status('warning', 'Error posting data: ' + err);
      }
    });
    update_unlocked_scriptures();
  }

  let last_status=new Date();
  function show_status(status_type, message) {
    last_status=new Date();
    $('#status').html(`
      <div class="alert alert-${status_type}">
        ${message}
      </div>
      `);
    if (!message) {
      $('#status').html(`
        <div class="alert alert-primary">
        Primary program songs 2018
        </div>
      `);
    }
    if (message) {
      setTimeout(check_clear_status,5000);
    }
  }
  show_status('','');
  function check_clear_status() {
    let elapsed=(new Date())-last_status;
    if (elapsed>3000) {
      show_status('','');
    }
  }

  function setup_box(box, div) {
    update_count(box.id);
    div.find('#add').click(on_add);
    div.find('#subtract').click(on_subtract);
    div.find('#reset').click(on_reset);

    if (query.enable_seek!='true') {
      disable_seeking_forward(div.find('audio'));
    }
    div.find('audio')[0].addEventListener('ended', function() {
      div.find('audio')[0].currentTime=0;
      increment_count(box.id, 1);
      setTimeout(function() {
        on_report_back();
      },1000);
    });

    function on_add() {
      increment_count(box.id, 1);
      return false;
    }

    function on_subtract() {
      increment_count(box.id, -1);
      return false;
    }

    function on_reset() {
      set_count(box.id, 0);
      update_count(box.id);
      return false;
    }
  }

  function disable_seeking_forward(audio_elmt) {
    let audio = audio_elmt[0];
    let supposedCurrentTime = 0;
    audio.addEventListener('timeupdate', function() {
      if (!audio.seeking) {
        supposedCurrentTime = audio.currentTime;
      }
    });
    // prevent user from seeking
    audio.addEventListener('seeking', function() {
      // guard agains infinite recursion:
      // user seeks, seeking is fired, currentTime is modified, seeking is fired, current time is modified, ....
      var delta = audio.currentTime - supposedCurrentTime;
      if (delta > 0.01) {
        console.log("Seeking is disabled");
        audio.currentTime = supposedCurrentTime;
      }
    });
  }

  function increment_count(id, num) {
    set_count(id, get_count(id) + num);
    update_count(id);
  }

  function update_count(id) {
    $(`#${id} .count`).html(get_count(id));
  }

  function get_record() {
    let rec={};
    try {
      rec = JSON.parse(localStorage['primaryprogram_record']) || {};
      if (typeof(rec) != 'object')
        rec = {};
    } catch (err) {
    }
    rec.from=query.from||'';
    return rec;
  }

  function set_record(rec) {
    try {
      localStorage['primaryprogram_record'] = JSON.stringify(rec);
    } catch (err) {

    }
  }
  //set_record(get_record());

  function get_count(id) {
    let rec = get_record();
    let counts = rec.counts || {};
    return Number(counts[id] || 0);
  }

  function set_count(id, num) {
    if (num < 0) num = 0;
    let rec = get_record();
    if (!rec.counts) rec.counts = {};
    let counts = rec.counts;
    counts[id] = num;
    set_record(rec);
  }

});


function parse_url_params() {
  var match;
  var pl = /\+/g; // Regex for replacing addition symbol with a space
  var search = /([^&=]+)=?([^&]*)/g;
  var decode = function(s) {
    return decodeURIComponent(s.replace(pl, " "));
  };
  var query = window.location.search.substring(1);
  var url_params = {};
  while (match = search.exec(query))
    url_params[decode(match[1])] = decode(match[2]);
  return url_params;
}

function make_random_id(len) {
  // return a random string of characters
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < len; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
