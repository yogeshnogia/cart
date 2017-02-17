"use strict";

angular.module('services.cart', [])
  .service('Cart', ['$rootScope', 'Reviewer', function ($rootScope, Reviewer) {

    //use an object lateral instead of array, 
    //hash table is faster than seeking in an array.
    var itemsDictionary = {};

    
    var hasLocalStorage = function() {
      try {
        return (window.hasOwnProperty("localStorage") && window["localStorage"] !== null)
      } catch(error) {
        return false;
      }
    };

    
    var refresh = function() {
      $rootScope.$broadcast("refresh-cart");
    };

    
    var persist = function() {
      if(hasLocalStorage()) {
        window.localStorage["cart"] = itemsDictionary;
      }
    };
 
    
    var save = function() {
      var self = this;
      //the Reviewer.review returns a promise.
      Reviewer.review(this.getCart()).then(function(data) {
        self.persist();
        self.refresh();
      },
      function(error) {
        throw new Error("Cart Service :: save - " + error);
      });
    };

    if(hasLocalStorage()) {
      itemsDictionary = window.localStorage["cart"] || {};
    }

    
    var getCart = function() {
      var items = [];

      for(var itemKey in itemsDictionary)
        items.push(itemsDictionary[itemKey]);

      return items;
    };

   
    var addItem = function(itemId, quantity) {
      if(typeof itemId === "undefined" || itemId === null)
        throw new Error("Cart Service :: addItem - itemId is undefined/null");

      if(itemsDictionary.hasOwnProperty(itemId))
        throw new Error("Cart Service :: addItem - this itemId " + itemId + " already exists");

      if(typeof quantity === "undefined" || quantity === null || quantity <= 0)
        throw new Error("Cart Service :: addItem - the quantity " + quantity + " is not valid");

      itemsDictionary[itemId] = {itemId: itemId, quantity: quantity};
      this.save();
    };

  
    var addItems = function(items) {
      if(typeof items === "undefined" || items === null)
        throw new Error("Cart Service :: addItems - itemId undefined/null");

      
      for(var i = 0; i < items.length; i++)
        this.addItem(items[i].itemId, items[i].quantity);
    };

    var remove = function (itemId) {
      if(typeof itemId === "undefined" || itemId === null)
        throw new Error("Cart Service :: remove - itemId is undefined/null");

      if(itemsDictionary.hasOwnProperty(itemId)) {
        delete itemsDictionary[itemId];
        this.save();
      } else {
        throw new Error("Cart Service :: remove - this itemId " + itemId + " doesn't exist");
      }
    };
 
    
    var clear = function() {
      itemsDictionary = {};
      this.save();
    };

    
    var changeQuantity = function (itemId, quantity) {
      if(typeof itemId === "undefined" || itemId === null)
        throw new Error("Cart Service :: changeQuantity - itemId is undefined/null");

      if(itemsDictionary.hasOwnProperty(itemId))
        throw new Error("Cart Service :: changeQuantity - this itemId " + itemId + " doesn't exist");

      if(typeof quantity === "undefined" || quantity === null)
        throw new Error("Cart Service :: changeQuantity - the quantity " + quantity + " is not valid");

      //if the quantity is zero, then the user wants to remove this item.
      if(quantity === 0) {
        this.remove(itemId);
      } else {
        itemsDictionary[itemId].quantity = quantity;
        this.save();
      }
    };

   
    return {
      getCart: getCart,
      addItem: addItem,
      addItems: addItems,
      save: save,
      remove: remove,
      clear: clear,
      changeQuantity: changeQuantity,
      refresh: refresh
    };

  }]);