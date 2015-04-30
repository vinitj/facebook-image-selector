var React = require('react'),
	async = require('async'),
	_ = require('underscore'),
	qs = require('query-string'),
	Stylesheet = require('../lib/Stylesheet'),
	FacebookImageSelector, ImageLoader,
	loginCounter = true,
	ErrorMessages;

ErrorMessages =  {
	"default" : "Some error occured while loading, Please try again after some time.",
	"notLoggedin" : "You are not logged in!. Please log into Facebook",
	"unauthorized" : "You have not authorized this app!. Please provide the required permission (user_photos)",
	"noAppId" : "No App Id specified"
};

FacebookImageSelector = React.createClass({

	displayName: "FacebookImageSelector",

	mixins: [Stylesheet],

	getDefaultProps: function () {
		return {
			clickText: "Upload Image via Facebook"
		};
	},

	defaultState: function () {
		return {
			albumsLoaded: true,
			showOverlay: false,
			showError: false,
			albumDataLoaded: {},
			photoDataLoaded: {},
			albumPaging: {},
			photoPaging: {},
			customError: ""
		};
	},

	getInitialState: function () {
		return this.defaultState();
	},


	componentDidMount: function () {
		var self = this;
		window.addEventListener("keyup", this.escapeListener, false);
		this.loadStylesheet('/css/facebookImageSelector.css');
		if (self.props.appId) {
			window.fbAsyncInit = function() {
				FB.init({
					appId      : self.props.appId,
					cookie     : true,  // enable cookies to allow the server to access
					                // the session
					xfbml      : true,  // parse social plugins on this page
					version    : 'v2.3' // use version 2.1
				});
			}.bind(this);

				// Load the SDK asynchronously
			(function(d, s, id){
			var js, fjs = d.getElementsByTagName(s)[0];
			if (d.getElementById(id)) {return;}
			js = d.createElement(s); js.id = id;
			js.src = "//connect.facebook.net/en_US/sdk.js";
			fjs.parentNode.insertBefore(js, fjs);
			}(document, 'script', 'facebook-jssdk'));
		};
    },

    componentWillUnmount: function () {
		window.removeEventListener("keyup", this.escapeListener);
	},

	// This is called with the results from from FB.getLoginStatus().
	statusChangeCallback: function(response) {
		if (response.status === 'connected') {
			this.getUserAlbums({});
		} else if (response.status === 'not_authorized') {
			this.showError(ErrorMessages.unauthorized);
		} else {
			if (loginCounter) {
				FB.login(this.statusChangeCallback, {scope: 'user_photos', return_scopes: true});
			} else {
				loginCounter = false;
				this.showError(ErrorMessages.notLoggedin);
			}
		}
	},

	handleFacebookImageSelector: function() {
		FB.getLoginStatus(this.statusChangeCallback, {scope: 'user_photos',
			return_scopes: true
		});
	},

	getUserAlbums: function (query) {
		var auth = FB.getAuthResponse(), uid = auth.userID, self = this, queryObj = {"fields" : "id,name"};
		_.extend(queryObj, query);
		FB.api(
			"/" + uid + "/albums",
			queryObj,
			function (response) {
				if (response && !response.error) {
					self.populateAlbums(response);
				} else {
					self.showError();
				}
		    }
		);
	},

	populateAlbums: function (response) {
		/* get photo album images */
		var task = {}, i, data = response.data, self = this, paging = response.paging;
		for (i in data) {
			if (data.hasOwnProperty(i)) {
				task[data[i].id] = function (temp) {
					var albumId = temp.id;
					return function (callback) {
						FB.api(
							"/" + albumId + "/picture",
							{
								"type": "album"
							},
							function (response) {
								var res = {};
								if (response && !response.error) {
									/* handle the result */
									res.name = temp.name;
									res.url = response.data.url;
									callback(null, res);
								} else {
									callback({}, null);
								}
							}
						)
					}
				}(data[i]);
			}
		}

		async.parallel(task, function (error, results) {
			if (!error) {
				self.setState({ showOverlay: true, showError: false,
								albumDataLoaded: _.extend(self.state.albumDataLoaded, results), albumPaging : paging});
			} else {
				self.showError();
			}
		});
	},

	closeOverlay : function (e) {
		this.setState(this.defaultState());
	},

	escapeListener: function (e) {
		var keyCode = e.keyCode;
		if (keyCode === 27 && this.state.showOverlay === true) {
			this.closeOverlay();
		}
	},

	getPhotosFromAlbum: function (id, query) {
		var queryObj = {"fields" : "id,height,width,source"}, modifiedResponse = {}, i, data, self = this, paging;
		_.extend(queryObj, query);
		FB.api(
			"/" + id + "/photos",
			queryObj,
			function (response) {
				if (response && !response.error) {
					// modify data to support the need;
					data = response.data;
					paging = response.paging;
					for (i in data) {
						if (data.hasOwnProperty(i)) {
							modifiedResponse[data[i].id] = data[i];
						}
					}
					self.setState({albumsLoaded: false, showError: false, photoPaging: paging,
					              showOverlay: true, photoDataLoaded: _.extend(self.state.photoDataLoaded, modifiedResponse)});
				} else {
					self.showError();
				}
			}
		);
	},

	itemSelector: function (dataset) {
		var type = dataset.type, id = dataset.id, imageSource;
		if (type === "album") {
			// get album id
			this.getPhotosFromAlbum(id, {});
		} else {
			imageSource = this.state.photoDataLoaded[id];
			if (imageSource) {
				this.getURLasFileObj(imageSource.source);
			}
		}
	},

	getURLasFileObj: function (url) {
		var myRequest = new XMLHttpRequest(), self = this;
		myRequest.open("GET", url);
		myRequest.responseType = "blob";//force the HTTP response, response-type header to be blob
		myRequest.onload = function() {
			var blob = myRequest.response,
				type = blob.type.split("/")[1] || "jpg";
			blob.name = "facebook_upload." + type;
			self.props.onSelection(blob);
			self.closeOverlay();
		}
		myRequest.send();
	},

	getMoreItems: function (paging, type) {
		var cursor = paging.cursors, queries, pathSplitter, querySplitter;
		if (paging.next) {
			querySplitter = paging.next.split("?");
			if (querySplitter.length > 1) {
				queries = qs.parse(querySplitter[1]);
				if (type) {
					// Albums
					this.getUserAlbums({"limit" : queries.limit, "after": queries.after});
				} else {
					pathSplitter = querySplitter[0].split("/");
					if (pathSplitter && pathSplitter.length >= 2) {
						this.getPhotosFromAlbum(pathSplitter[pathSplitter.length - 2], {"limit" : queries.limit, "after": queries.after});
					} else {
						this.showError();
					}
				}
			} else {
				this.showError();
			}
		}
	},

	showError : function (error) {
		this.setState({showOverlay: true, showError: true, customError: error || ErrorMessages["default"]});
	},

	getAlbumData: function () {
		this.setState({albumsLoaded: true, photoDataLoaded: {}});
	},

	render: function() {
		var state = this.state;
		if (this.props.appId) {
			return (
				React.createElement("div", {className: "facebookImageSelector"}, 
					(state.showOverlay) ?  React.createElement(ImageLoader, {data: (state.albumsLoaded) ? state.albumDataLoaded : state.photoDataLoaded, 
							type: state.albumsLoaded, closeOverlay: this.closeOverlay, itemSelector: this.itemSelector, albumSelector: this.getAlbumData, 
							isError: state.showError, loadMore: this.getMoreItems, customError: state.customError, 
							paging: (state.albumsLoaded) ? state.albumPaging : state.photoPaging}) : '', 
					React.createElement("div", {className: "fblogin", onClick: this.handleFacebookImageSelector}, this.props.clickText)
				)
			);
		} else {
			return (React.createElement("div", {className: "facebookImageSelector"}, ErrorMessages.noAppId));
		}
	}
});

ImageLoader = React.createClass({displayName: "ImageLoader",

	locker: false,

	getInitialState: function () {
		return {
			showSpinner: false,
			loadMoreDataSpinner: false,
			isBorder: {},
			selectedId: null
		}
	},

	componentDidMount: function () {
		if (this.props.paging.next) {
			this.addScrollListener();
		}
	},

	componentWillUnmount: function () {
		this.removeScrollEventListener();
	},

	updateModule: _.debounce(function (e) {
		var target = e.target, props = this.props;
		if (!this.locker && target.scrollTop >= (target.scrollHeight - target.offsetHeight - 150)) {
			this.locker = true;
			this.setState({loadMoreDataSpinner : true});
			props.loadMore(props.paging, props.type);
		}
	}, 15),

	removeScrollEventListener: function () {
		var dataNode = React.findDOMNode(this.refs.dataNode);
		if (dataNode) {
			dataNode.removeEventListener('scroll', this.updateModule);
		}
	},

	addScrollListener: function () {
		var dataNode = React.findDOMNode(this.refs.dataNode);
		if (dataNode) {
			dataNode.addEventListener('scroll', this.updateModule, false);
		}
	},

	componentWillReceiveProps: function(nextProps) {
		this.removeScrollEventListener();
		if (nextProps.paging.next) {
			this.addScrollListener();
		}
		this.setState({showSpinner : false, loadMoreDataSpinner: false});
		this.locker = false;
	},

	render: function () {
		var props = this.props, data = props.data, self = this, state = this.state,
			type = (self.props.type) ? "album" : "photos",
			allAlbums = _.map(data, function (value, key) {
				var borderStyle = {};
				if (state.isBorder[key]) {
					borderStyle = {"border" :  "2px solid #3B5998"};
				}
				return (
					React.createElement("div", {className: "block", key: type + key, onClick: self.albumSelector, onDoubleClick: self.photoSelector, "data-type": type, "data-id": key}, 
						React.createElement("div", {className: "front-image", style: borderStyle}, 
							React.createElement("div", null, 
								React.createElement("img", {src: value.url || value.source})
							)
						), 
						(value.name) ? React.createElement("div", {className: "album-name"}, value.name) : ''
					)
				);
			});
		return (
			React.createElement("div", {className: "overlay"}, 
				React.createElement("div", {className: "content"}, 
					React.createElement("header", {className: "clearfix"}, 
						React.createElement("div", {className: "cross", onClick: self.closeOverlay}, "X"), 
						React.createElement("div", null, "Facebook photo selector")
					), 
					React.createElement("section", null, 
						(!props.type) ? React.createElement("div", {className: "heading"}, 
								React.createElement("div", {className: "back", onClick: self.backAlbumSelector}, "Back to albums"), 
								React.createElement("div", null, "Select a nice photo")
							)
							: React.createElement("div", {className: "heading"}, React.createElement("div", null, "Select an album")), 
						
						React.createElement("div", null, 
						(props.isError) ? React.createElement("div", {className: "block-container-error"}, props.customError) :
								React.createElement("div", {className: "block-container", ref: "dataNode"}, 
									allAlbums
								), 
						
						(state.showSpinner) ? React.createElement("div", {className: "block-container-spinner"}, React.createElement("div", {className: "loader"})) : '', 
						(state.loadMoreDataSpinner) ? React.createElement("div", {className: "block-container-loadmore"}, React.createElement("div", {className: "loader"})) : ''
						)
					), 
					React.createElement("footer", null, 
						React.createElement("div", {onClick: self.closeOverlay}, "Cancel"), 
						(!props.type) ? React.createElement("div", {className: "selector", onClick: self.okSelector}, "OK") : ''
					)
				), 
				React.createElement("div", {className: "cover"})
			)
		);
	},

	backAlbumSelector: function (e) {
		this.setState({showSpinner: true});
		this.props.albumSelector(e);
	},

	albumSelector: function (e) {
		var id = e.currentTarget.dataset.id, border = {};
		if (this.props.type) {
			this.selector(e);
		} else {
			border[id] = true;
			this.setState({isBorder: border, selectedId: id});
		}
	},
	/* called during double click */
	photoSelector: function (e) {
		if (!(this.props.type)) {
			this.selector(e);
		} else {
			return;
		}
	},

	okSelector: function (e) {
		this.setState({showSpinner: true});
		this.props.itemSelector({id : this.state.selectedId, type: "photo"});
	},

	selector: function (e) {
		this.setState({showSpinner: true});
		this.props.itemSelector(e.currentTarget.dataset);
	},

	closeOverlay: function (e) {
		this.props.closeOverlay()
	}
});

module.exports = FacebookImageSelector;