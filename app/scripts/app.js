/*
Copyright (c) 2015 The Polymer Project Authors. All rights reserved.
This code may only be used under the BSD style license found at http://polymer.github.io/LICENSE.txt
The complete set of authors may be found at http://polymer.github.io/AUTHORS.txt
The complete set of contributors may be found at http://polymer.github.io/CONTRIBUTORS.txt
Code distributed by Google as part of the polymer project is also
subject to an additional IP rights grant found at http://polymer.github.io/PATENTS.txt
*/

(function(document) {
  'use strict';

  // Grab a reference to our auto-binding template
  // and give it some initial binding values
  // Learn more about auto-binding templates at http://goo.gl/Dx1u2g
  var app = document.querySelector('#app');
  app.user = null;
  app.carDocumentUrl = '';
  app.noteDocumentUrl = '';
  app.noteContent = '';
  app.viewMode = true;
  app.distance = 0;
  app.carLocationSet = false;
  app.showError = false;
  app.isMobile = false;
  app.watchLocation = false;
  app.unsetWatch = false;

  app.parkingDescription = {

    description: ''

  };

  app.displayInstalledToast = function() {

    document.querySelector('#caching-complete').show();

  };

  // See https://github.com/Polymer/polymer/issues/1381
  window.addEventListener('WebComponentsReady', function() {

    app.firebaseUrl = 'https://car-lighthouse.firebaseio.com';
    app.carDocumentUrl = app.firebaseUrl;
    app.noteDocumentUrl = app.firebaseUrl;
    app.signedIn = false;

    //Detect if were on a mobile browser to decrease ad size
    if( /Android|webOS|iPhone|iPod|BlackBerry/i.test( navigator.userAgent ) ) {

      app.isMobile = true;

    }

    var params = { scope: 'email' };

    /**
     * If ready gets distance between two points
     * @param  {[type]} coord1 [description]
     * @param  {[type]} coord2 [description]
     * @return {[type]}        [description]
     */
    function _computeDistance ( coord1, coord2 ) {

      if ( coord1 && coord2 ) {

        var d2r = 0.0174532925199433;

        var dlong = ( coord2.lng - coord1.lng ) * d2r;
        var dlat = ( coord2.lat - coord1.lat ) * d2r;
        var a = Math.pow( Math.sin( dlat / 2.0 ), 2 ) + Math.cos( coord1.lat * d2r ) * Math.cos( coord2.lat * d2r ) * Math.pow( Math.sin( dlong / 2.0 ), 2 );
        var c = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );
        app.distance = ( 3956 * c ).toFixed( 2 ); 

      }

    }

    /**
     * Update the distance every 5 seconds
     * @return {[type]} [description]
     */
    function _computeDistanceLoop ( timeout ) {

      setTimeout( function () {

        if ( app.user !== undefined && app.user !== null && app.coords ) {

          _computeDistance( { 'lat': app.coords.latitude, 'lng': app.coords.longitude }, app.carLocation );

          _computeDistanceLoop( 5000 );

        }

      }, timeout );

    }

    /**
     * Sign in button clicked
     * @return {[type]} [description]
     */
    app.signInClicked = function () {

      if ( app.signedIn === false ) {

        app.$.firebaseLogin.login( params );

      } else {

        this.$.firebaseLogin.logout();

      }

    };

    /**
     * Update car location
     * @return {[type]} [description]
     */
    app.updateCarLocation = function () {

      app.carLocation = {

        'lat': app.coords.latitude,
        'lng': app.coords.longitude

      };

      _computeDistance( { 'lat': app.coords.latitude, 'lng': app.coords.longitude }, app.carLocation );

    };

    /**
     * Switch mode for displaying notes
     * @return {[type]} [description]
     */
    app.switchMode = function () {

      if ( app.viewMode === false ) {

        app.note = {

          content: app.noteContent

        };

      }

      app.viewMode = !app.viewMode;

    };

    /**
     * Get directions from the user to the car
     * @return {[type]} [description]
     */
    app.getDirections = function () {

      if ( app.carLocationSet === true && app.coords ) {

        var url = 'http://maps.google.com/maps?saddr=' + app.coords.latitude + ',' + app.coords.longitude + '&daddr=' + app.carLocation.lat + ',' + app.carLocation.lng + '&mode=walking';

        var win = window.open(url, '_blank');
        win.focus();

        app.showError = false;

      } else {

        app.showError = true;

      }

    };

    /**
     * Set note after getting it from the db
     */
    app.setNote = function () {

      if ( app.note !== undefined && app.note !== null ) {

        app.noteContent = app.note.content;

      }

    };

    app.setCarLocation = function () {

      if ( app.carLocation !== undefined && app.carLocation !== null ) {

        app.carLocationSet = true;

      }

    };

    app.showHelpModal = function () {

      app.$.helpDialog.toggle();

    };

    /**
     * User has succesfully logged in
     * @return {[type]} [description]
     */
    app.loggedIn = function () {

      app.signedIn = true;
      app.carDocumentUrl = app.firebaseUrl + '/' + app.user.uid + '/car';
      app.noteDocumentUrl = app.firebaseUrl + '/' + app.user.uid + '/note';
      app.watchLocation = true;

      //Kick off the location updates
      setTimeout( function () {

        _computeDistanceLoop( 1000 );

      });

    };

    /**
     * User has logged out
     * @return {[type]} [description]
     */
    app.loggedOut = function () {

        app.unsetWatch = true;
        app.watchLocation = false;
        app.viewMode = true;
        app.signedIn = false;
        app.carDocumentUrl = app.firebaseUrl;
        app.noteDocumentUrl = app.firebaseUrl;
        app.noteContent = '';
        app.note = {};
        app.carLocation = {};
        app.carLocationSet = false;
        app.distance = 0;
        app.showError = false;

    };

  });

})( document );