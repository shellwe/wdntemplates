/* globals define: false */
define(['wdn', 'jquery', 'dropdown-widget', 'require'], function(WDN, $, DropDownWidget, require) {
	"use strict";
	var getLinkByRel = function(name) {
			return $('link[rel=' + name + ']');
		},
		getLocalIdmSettings = function() {
			var loginLink = getLinkByRel('login'),
				logoutLink = getLinkByRel('logout');

			if (loginLink.length) {
				WDN.setPluginParam('idm', 'login', loginLink.attr('href'));
			}
			if (logoutLink.length) {
				WDN.setPluginParam('idm', 'logout', logoutLink.attr('href'));
			}

			return WDN.getPluginParam('idm') || {};
		},
		dcfSel = '#dcf',
		mainSel = dcfSel + '-idm',
		userSel = mainSel + '-username',
		logoutSel = mainSel + '-logout',
		loginSrv = 'https://login.unl.edu/',
		ssoCook = 'unl_sso',
		encLoc = encodeURIComponent(window.location),
		logoutURL = loginSrv + 'cas/logout?url=' + encLoc,
		loginURL = loginSrv + 'cas/login?service=' + encLoc,
		serviceURL = loginSrv + 'services/whoami/?id=',
		avatarService = 'https://directory.unl.edu/avatar/',
		planetRed = 'https://planetred.unl.edu/pg/',
		defaultLinkText,
		user = false,
		loggedOutSel = '#dcf-idm-status-logged-out',
		loggedInSel = '#dcf-idm-status-logged-out';

	var getUserField = function(field) {
			if (!user || !user[field]) {
				return false;
			}

			return user[field][0];
		};

	var Plugin = {
		initialize : function(callback) {
			var loginCheckFailure = function() {
					$(function() {
						var localSettings = getLocalIdmSettings();
						defaultLinkText = $(userSel).html();
						if (localSettings.login) {
							Plugin.setLoginURL(localSettings.login);
						} else {
							Plugin.renderAsLoggedOut();
						}
					});

					if (callback) {
						callback();
					}
				},
				cookie = WDN.getCookie(ssoCook);

			if (cookie) {
				require([serviceURL + cookie], function() {
					// the whoami service injects into WDN.idm namespace
					if (WDN.idm.user) {
						Plugin.setUser(WDN.idm.user);
						delete WDN.idm.user;
					}

					if (Plugin.getUserId()) {
						if (callback) {
							callback();
						}
						$(function() {
							Plugin.renderAsLoggedIn();
						});
					} else {
						// User's CAS session is no longer active, kill cookie
						Plugin.logout();
						loginCheckFailure();
					}
				});
			} else {
				loginCheckFailure();
			}
		},

		/**
		 * Set the current user. The object should have fields as described by CAS
		 * 
		 * @param newUser object|false
		 */
		setUser : function(newUser) {
			user = newUser
		},

		logout : function() {
			WDN.setCookie(ssoCook, '0', -1);
			user = false;
		},

		/**
		 * Checks if the user is logged in
		 *
		 * @return bool
		 */
		isLoggedIn : function() {
			return !!Plugin.getUserId();
		},

		/**
		 * Returns the uid of the logged in user.
		 *
		 * @return string
		 */
		getUserId : function() {
			return user && user.uid;
		},

		/**
		 * Get the logged in user's display name (full name)
		 *
		 * @returns {string}
		 */
		getDisplayName : function() {
			var disp_name = '';
			if (user.eduPersonNickname) {
				disp_name = user.eduPersonNickname[0];
			} else if (user.givenName) {
				disp_name = user.givenName[0];
			} else if (user.displayName) {
				disp_name = user.displayName[0];
			}

			return disp_name;
		},

		/**
		 * Get the logged in user's last name only
		 *
		 * @returns {false|string}
		 */
		getFirstName : function() {
			return getUserField('givenName');
		},

		/**
		 * Get the logged in user's first name only
		 *
		 * @returns {false|string}
		 */
		getLastName : function() {
			return getUserField('sn');
		},

		/**
		 * Get the logged in user's primary affiliation.  IE: staff or faculty
		 *
		 * @returns {false|string}
		 */
		getPrimaryAffiliation : function() {
			return getUserField('eduPersonPrimaryAffiliation');
		},

		/**
		 * Get the logged in user's email address
		 *
		 * @returns {false|string}
		 */
		getEmailAddress : function() {
			return getUserField('mail');
		},

		/**
		 * Get the logged in user's postal address
		 *
		 * @returns {false|string}
		 */
		getPostalAddress : function() {
			return getUserField('postalAddress');
		},

		/**
		 * Get the logged in user's telephone number
		 *
		 * @returns {false|string}
		 */
		getTelephoneNumber : function() {
			return getUserField('telephoneNumber');
		},

		/**
		 * Get the logged in user's title
		 *
		 * @returns {false|string}
		 */
		getTitle : function() {
			return getUserField('title');
		},

		/**
		 * Get the profile (planet red) URL
		 * 
		 * @returns {string}
		 */
		getProfileURL : function() {
			if (!this.isLoggedIn()) {
				return false;
			}
			
			var uid = this.getUserId();
			
			// in planet red's use of CAS, staff usernames are converted like jdoe2 -> unl_jdoe2
			//  and student usernames are converted like s-jdoe3 -> unl_s_jdoe3
			var planetred_uid = 'unl_';
			if (uid.substring(2,0) === 's-') {
				planetred_uid += uid.replace('-','_');
			} else {
				planetred_uid += uid;
			}

			return planetRed + 'profile/' + planetred_uid;
		},

		/**
		 * Update the SSO tab and display user info
		 */
		renderAsLoggedIn : function() {
			var localSettings = getLocalIdmSettings(),
				$loggedOutContainer = $(loggedOutSel),
				$loggedInContainer = $(loggedInSel);
			
			//Set up the idm button
			var $button = $('<button>', {
				'class': 'dcf-u-p0 dcf-u-b0 dcf-u-bg-transparent dcf-c-mobile-nav-toggle dcf-c-idm__toggle unl-u-font-sans" id="dcf-idm-toggle',
				'aria-expanded': 'false',
				'aria-controls': 'dcf-idm-options',
				'aria-label': 'Account actions for ' + this.getDisplayName()
			});
			var $buttonContents = $('<span>', {
				'class': 'dcf-u-flex dcf-u-flex-col dcf-u-ai-center dcf-u-jc-center dcf-u-h100'
			});
			$buttonContents.append($('<img>', {
				'class': 'dcf-u-block dcf-u-circle',
				'src': avatarService + this.getUserId(),
				'alt': '',
				'style': 'height: 2em; width: 2em; background-color: #d00000;'
			}));
			$buttonContents.append($('<span>', {
				'class': 'dcf-u-sm2'
			}).text(this.getDisplayName()));
			$button.append($buttonContents);
			
			//Set up the IDM options
			var $optionsContainer = $('<div>', {
				'id': 'dcf-idm-options',
				'class': 'dcf-u-overlay-dark dcf-c-idm__options',
				'hidden': true
			});
			
			var $navUL = $('<ul>', {
				'class': 'dcf-c-list-unstyled'
			});
			
			//Add the profile link
			$navUL.append($('<li>').append($('<a>', {
				'href': this.getProfileURL()
			}).text('View Profile')));
			
			//Add the logout link (set it as a variable so that we can reference it later)
			var $logoutLink = $('<a>', {
				'href': logoutURL,
				'id': 'dcf-idm-logout'
			}).text('Logout');
			$navUL.append($('<li>').append($logoutLink));

			//Attach the UL to the options container
			$optionsContainer.append($navUL);

			$loggedInContainer.html(''); //Clear any existing contents
			$loggedInContainer.append($button); //add new stuff
			$loggedInContainer.append($optionsContainer);

			//Add JS functionality to make this work
			var $dropdownNav = new DropDownWidget($loggedInContainer[0]);

			//Show the contents
			$loggedInContainer.attr('hidden', true);
			$loggedOutContainer.removeAttr('hidden');

			// Any time logout link is clicked, unset the user data
			$logoutLink.off('click').click(Plugin.logout);
			Plugin.setLogoutURL(localSettings.logout);
		},

		renderAsLoggedOut : function() {
			if (Plugin.getUserId()) {
				//if the user is already logged in, we should not reset the login
				return;
			}

			var $loggedOutContainer = $(loggedOutSel),
				$loggedInContainer = $(loggedInSel),
				loginLink = $(userSel);

			loginLink.attr('href', loginURL);

			$loggedInContainer.attr('hidden', true);
			$loggedOutContainer.removeAttr('hidden');
		},

		/**
		 * Set the URL to send the user to when the logout link is clicked
		 */
		setLogoutURL : function(url) {
			if (url) {
				logoutURL = url;
			}
		},

		/**
		 * Set the URL to send the user to when the login link is clicked
		 */
		setLoginURL : function(url) {
			if (url) {
				loginURL = url;
			}
		}
	};

	WDN.idm = {}; // must expose the WDN.idm namespace for the whoami service
	return Plugin;
});
