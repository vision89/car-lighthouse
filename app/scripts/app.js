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
  app.userLocationSet = false;
  app.carLocationSet = false;
  app.showError = false;
  app.isMobile = false;
  app.userLocation = {

    lat: 0,
    lng: 0
  };

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

    function _updateLocation () {

      //Look for user location
      if ( navigator.geolocation && app.user !== undefined && app.user !== null ) {

        navigator.geolocation.getCurrentPosition( function ( position ) {

          app.set( 'userLocation.lat', position.coords.latitude );
          app.set( 'userLocation.lng', position.coords.longitude );

          app.userLocationSet = true;

        });

      } else {

        //Device is not compatible

      }

    }

    /**
     * Update the distance every 5 seconds
     * @return {[type]} [description]
     */
    function _computeDistanceLoop () {

      setTimeout( function () {

        if ( app.user !== undefined && app.user !== null ) {

          _updateLocation();

          _computeDistance( app.userLocation, app.carLocation );

          _computeDistanceLoop();

        }

      }, 5000 );

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

        'lat': app.userLocation.lat,
        'lng': app.userLocation.lng

      };

      _computeDistance( app.userLocation, app.carLocation );

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

    app.getDirections = function () {

      if ( app.carLocationSet === true && app.userLocationSet === true ) {

        var url = 'http://maps.google.com/maps?saddr=' + app.userLocation.lat + ',' + app.userLocation.lng + '&daddr=' + app.carLocation.lat + ',' + app.carLocation.lng + '&mode=walking';

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

    /**
     * User has succesfully logged in
     * @return {[type]} [description]
     */
    app.loggedIn = function () {

      app.signedIn = true;
      app.carDocumentUrl = app.firebaseUrl + '/' + app.user.uid + '/car';
      app.noteDocumentUrl = app.firebaseUrl + '/' + app.user.uid + '/note';

      //Kick off the location updates
      setTimeout( function () {

        _updateLocation();

        _computeDistanceLoop();

      });

    };

    /**
     * User has logged out
     * @return {[type]} [description]
     */
    app.loggedOut = function () {

        app.viewMode = true;
        app.signedIn = false;
        app.carDocumentUrl = app.firebaseUrl;
        app.noteDocumentUrl = app.firebaseUrl;
        app.noteContent = '';
        app.note = {};
        app.carLocation = {};
        app.carLocationSet = false;
        app.userLocationSet = false;
        app.distance = 0;
        app.showError = false;

    };

  });

  // Main area's paper-scroll-header-panel custom condensing transformation of
  // the appName in the middle-container and the bottom title in the bottom-container.
  // The appName is moved to top and shrunk on condensing. The bottom sub title
  // is shrunk to nothing on condensing.
  addEventListener('paper-header-transform', function(e) {
    var appName = document.querySelector('.app-name');
    var middleContainer = document.querySelector('.middle-container');
    var bottomContainer = document.querySelector('.bottom-container');
    var detail = e.detail;
    var heightDiff = detail.height - detail.condensedHeight;
    var yRatio = Math.min(1, detail.y / heightDiff);
    var maxMiddleScale = 0.50;  // appName max size when condensed. The smaller the number the smaller the condensed size.
    var scaleMiddle = Math.max(maxMiddleScale, (heightDiff - detail.y) / (heightDiff / (1-maxMiddleScale))  + maxMiddleScale);
    var scaleBottom = 1 - yRatio;

    // Move/translate middleContainer
    Polymer.Base.transform('translate3d(0,' + yRatio * 100 + '%,0)', middleContainer);

    // Scale bottomContainer and bottom sub title to nothing and back
    Polymer.Base.transform('scale(' + scaleBottom + ') translateZ(0)', bottomContainer);

    // Scale middleContainer appName
    Polymer.Base.transform('scale(' + scaleMiddle + ') translateZ(0)', appName);
  });

})(document);
