app.addModule('album', function () {
	this.init = function () {
		var tracksModule = app.getModule('tracks');
		
		click('.album_button', function () {
			$('.album .track:first .track_image').get(0).click();
		});
	};
});
app.addModule('autocomplete', function () {
	this.init = function () {
		$("#search").autocomplete({
			minLength: 3,
			source: function (request, response) {
				$.ajax({
					method: 'get',
					dataType: "json",
					url: 'search.json',
					data: {
						term: request.term
					},
					success: function (data) {
						response( data );
					}
				})
			},
			select: function (event, ui) {
				console.log(ui.item.url);
			}
		});
		
		
	};
});
app.addModule('header', function () {
	this.init = function () {
		$('.header_btn').click(function () {
			$('.header_list').toggleClass('active');
		});
		
		$(document).click(function (e) {
			if (!$(e.target).closest('.header').length) {
				$('.header_list').removeClass('active');
			}
		});
		
		$('.header_list a').click(function () {
			$('.header_list').removeClass('active');
		})
	};
});
app.addModule('mobile-load', function () {
	this.init = function () {
		$('[data-clone-id]').each(function () {
			var element = $('#' + $(this).attr('data-clone-id'));
			
			if (element.length) {
				$(this).append(
					element.clone(true, true).removeAttr('id').addClass('__cloned')
				);
			}
			
			$(this).removeAttr('data-clone-id');
		});
	};
});
app.addModule('player', function () {
	var tracksModule, playListModule;
	var self = this;
	
	this.init = function () {
		tracksModule = app.getModule('tracks');
		playListModule = app.getModule('playlists');
		
		audioPlayer = new Plyr('#audioPlayer', {
			i18n: playerLang,
		});
		
		click('.player_play', function () {
			if (tracks.length === 0) {
				tracksModule.playPlayListIfPossible();
			}
			
			self.play();
		});
		
		click('.player_pause', function () {
			self.pause();
		});
		
		click('.player_mix', function () {
			$(this).toggleClass('active');
		});
		
		click('.player_repeat', function () {
			if ($(this).hasClass('__repeat_once')) {
				$(this).removeClass('__repeat __repeat_once');
			} else if ($(this).hasClass('__repeat')) {
				$(this).removeClass('__repeat').addClass('__repeat_once');
			} else {
				$(this).addClass('__repeat');
			}
		});
		
		click('.player_next', function () {
			if (self.isRandom()) {
				self.changeRandom();
			} else {
				var next = tracksModule.getNext();
			
				if (next) {
					self.changeTrack(next);
					tracksModule.changeTrack($(next.el));
				}
			}
		});
		
		click('.player_prev', function () {
			if (self.isRandom()) {
				self.changeRandom();
			} else {
				var prev = tracksModule.getPrev();
				
				if (prev) {
					self.changeTrack(prev);
					tracksModule.changeTrack($(prev.el));
				}
			}
		});
		
		audioPlayer.on('ended', function () {
			self.pause();
			
			var $repeat = $('.player_repeat');
			
			if ($repeat.hasClass('__repeat_once')) {
				self.play();
			} else if ($repeat.hasClass('__repeat')) {
				if (self.isRandom()) {
					self.changeRandom();
				} else {
					var next = tracksModule.getNext();
					
					if (!next) {
						next = tracks[0];
					}
					self.changeTrack(next);
					tracksModule.changeTrack($(next.el));
				}
			}
		});
	};
	
	this.play = function () {
		if ($('#audioPlayer').attr('src') === '') {
			return;
		}
		
		audioPlayer.play();
		
		$('.player_play').addClass('__hidden');
		$('.player_pause').addClass('__visible');
		$('.player').addClass('active');
		
		tracksModule.htmlToPlayTrack();
		playListModule.htmlToPlayTrack();
	};
	this.pause = function () {
		audioPlayer.pause();
			
		$('.player_pause').removeClass('__visible');
		$('.player_play').removeClass('__hidden');
		$('.player').removeClass('active');
		
		tracksModule.htmlToPauseTrack();
		playListModule.htmlToPauseTrack();
	};
	
	this.changeTrack = function (trackObj) {
		tracks.forEach(function (track) {
			track.playing = false;
		});
		
		$('.player_image img').attr('src', trackObj.image);
		$('.player_name').html(trackObj.name);
		$('.player_links').html(trackObj.info);
		
		$('#audioPlayer').attr('src', trackObj.track);
		
		trackObj.playing = true;
	};
	this.isRandom = function () {
		return $('.player_mix').hasClass('active');
	};
	this.changeRandom = function () {
		var elem = tracks[randomInteger(0, tracks.length - 1)];
		self.changeTrack(elem);
		tracksModule.changeTrack($(elem.el));
	};
	this.initLoadList = function () {
		var first = $('.load-playlist .track:first .track_image');
		first.get(0).click();
		first.get(0).click();
	};
});
app.addModule('playlists', function () {
	this.init = function () {
		var loadData = false;
		
		click('.playlists_sound', function (e) {
			e.preventDefault();
			
			var $this = $(this);
				
			if ($(this).closest('.playlists_image').attr('data-playing') === 'true') {
				$('.load-playlist .track:first .track_image').get(0).click();
			} else {
				$.ajax({
					method: 'get',
					dataType: 'html',
					url: $this.attr("href"),
					success: function (data) {
						loadData = data;
					}
				});
				
				afterLoadData(loadData);
			}

			function afterLoadData(data) {
				if (!data) {
					setTimeout(function () {
						afterLoadData(loadData);
					}, 300);
					
					return;
				}
				
				$('.playlists_image').removeAttr('data-playing').removeClass('active');
				$('.tracks').html(data);
				var first = $('.load-playlist .track:first .track_image');
				first.closest('.tracks').removeAttr('data-activated');
				first.get(0).click();
				$this.closest('.playlists_image').addClass('active');
				$this.closest('.playlists_image').attr('data-playing', 'true');
				
				loadData = false;
			}
		});
	};
	
	this.htmlToPauseTrack = function ($track) {
		$track = $track || $('.playlists_image[data-playing]');
		
		$track.removeClass('active');
	};
	this.htmlToPlayTrack = function ($track) {
		$track = $track || $('.playlists_image[data-playing]');
		
		$track.addClass('active');
	};
});
app.addModule('popup', function () {
	this.init = function () {
		$('.popup').magnificPopup({
			preloader: false,
			showCloseBtn: false,
			removalDelay: 300,
			mainClass: 'mfp-fade'
		});
		
		$('.popup-image').magnificPopup({
			preloader: false,
			showCloseBtn: false,
			removalDelay: 300,
			mainClass: 'mfp-fade',
			type: 'image'
		});
		
		$('.popup-youtube, .popup-vimeo, .popup-gmaps').magnificPopup({
			disableOn: 700,
			type: 'iframe',
			mainClass: 'mfp-fade',
			removalDelay: 160,
			preloader: false,

			fixedContentPos: false
		});
		
		$('.popup-close').click(function (e) {
			e.preventDefault();
			$.magnificPopup.close();
		});
	};
});
app.addModule('top-header', function () {
	this.init = function () {
		$('.top-header_user-txt').click(function () {
			$(this).closest('.top-header_user').toggleClass('active');
		});
		
		$('.top-header_btn').click(function () {
			$(this).toggleClass('active')
			$('.top-header_list').toggleClass('active')
		})
	}
});
app.addModule('tracks', function () {
	var playerModule;
	var self = this;
	
	this.isInited = false;
	this.init = function () {
		playerModule = app.getModule('player');
		
		click('.track_image', function (e) {
			e.preventDefault();
			var $tracks = $(this).closest('.tracks');
			
			if ($tracks.attr('data-activated') !== 'true') {
				self.activate($tracks);
				$tracks.attr('data-activated', 'true');
				self.isInited = true;
			}
			
			var $track = $(this).closest('.track');
			
			if (self.isPause($track)) {
				self.playTrack($track);
			} else if (self.isPlaying($track)) {
				self.pauseTrack($track);
			} else {
				self.changeTrack($track);
			}
		});
	};
	
	this.getIndex = function (el) {
		return tracks.findIndex(function (track) {
			return track.id === el.id;
		});
	};
	this.getCurrent = function () {
		return tracks.find(function (el) {
			return el.playing === true;
		});
	};
	this.getPrev = function () {
		var index = this.getIndex(this.getCurrent()) - 1;
		
		return tracks[index] ? tracks[index] : false;
	};
	this.getNext = function () {
		var index = this.getIndex(this.getCurrent()) + 1;
		
		return tracks[index] ? tracks[index] : false;
	};
	this.activate = function ($tracks) {
		tracks = [];
		
		$('.tracks').not($tracks).removeAttr('data-activated');
		
		$tracks.find('.track').each(function () {
			tracks.push({
				id: $(this).attr('data-id'),
				image: $(this).find('img').attr('src'),
				name: $(this).find('.track_artist').text() + ' - ' + $(this).find('.track_name').text(),
				info: $(this).find('.track_info').html(),
				track: $(this).attr('data-track'),
				playing: false,
				el: this
			});
		});
	};
	this.findTrack = function (id) {
		return tracks.find(function (track) {
			return track.id === id;
		});
	};
	this.changeTrack = function ($track) {
		var $tracks = $('.track');
		var trackObj = this.findTrack($track.attr('data-id'));
		
		$tracks.removeClass('active').removeAttr('data-playing');
		$track.addClass('active');
		$track.attr('data-playing', 'true');
		
		playerModule.changeTrack(trackObj);
		playerModule.play();
	};
	this.playTrack = function ($track) {
		this.htmlToPlayTrack($track);
		
		playerModule.play();
	};
	this.pauseTrack = function ($track) {
		this.htmlToPauseTrack($track);
		playerModule.pause();
	};
	this.htmlToPlayTrack = function ($track) {
		$track = $track || $('.track[data-playing]');
		
		$track.addClass('active');
		$track.attr('data-playing', 'true');
	};
	this.htmlToPauseTrack = function ($track) {
		$track = $track || $('.track[data-playing]');
		
		$track.removeClass('active');
		$track.attr('data-playing', 'stop');
	};
	this.isPlaying = function ($track) {
		return $track.attr('data-playing') === 'true';
	};
	this.isPause = function ($track) {
		return $track.attr('data-playing') === 'stop';
	};
	this.playPlayListIfPossible = function () {
		try {
			$('.load-playlist .track:first .track_image').get(0).click();
		} catch(e) {}
	}
});
app.addModule('user-playlist', function () {
	this.init = function () {
		$(document).on('keydown paste', '.user-playlist_head-new', function (event) {
			var len = Number($(this).attr('data-max-length'));

			if ($(this).text().length > len && event.keyCode != 8) {
				event.preventDefault();
			}
		});
		
		$(document).on('click', '.user-playlist_icon', function () {
			var item = $(this).closest('.user-playlist_item');
			
			item.find('.user-playlist_head').hide();
			item.find('.user-playlist_edit').show().get(0).focus();
		});
		
		
		$(document).on('blur', '.user-playlist_edit', function () {
			var item = $(this).closest('.user-playlist_item');
			
			item.find('.user-playlist_head').show();
			item.find('.user-playlist_edit').hide();
		})
	};
});
app.addModule('video-player', function () {
	this.init = function () {
		var $video = $('#player');
		videoPlayer = new Plyr('#player', {
			i18n: playerLang,
			volume: 1,
		});
		
		click('.video-block_image', function (e) {
			e.preventDefault();
			
			var parent = $(this).closest('.video-block_item');
			var src = parent.attr('data-src');
			var poster = parent.attr('data-poster');
			$video.attr('src', src);
			$video.attr('poster', poster);
			videoPlayer.play();
			$('.video-block_item').removeClass('active');
			parent.addClass('active');
		});
		
		videoPlayer.on('ended', function () {
			var $active = $('.video-block_item.active');
			var next = $active.next();
			if (next.length) {
				next.find('.video-block_image').get(0).click();
			}
		});
	};
});
jQuery(function () {
	app.callModules();
});