/*!
 * No Dependency Datalist
 * 2013 Steen Klingberg
 * @license MIT
 */
(function () {

	/* check if a polyfill is needed */
	if (typeof HTMLDataListElement === 'undefined') {

		// embeded mini version of tripledollar for convienency
		var	t$ = function (ident, attr, txt) {
		 	var	n = ident.split(/[\.#]/)
			 ,  t = ident.split(/[^\.#]+/)
			 ,	e;
			n.forEach(function (v, i) {
	  			if (i === 0) {
	    			e = document.createElement(v);
	  			} else {
	    			if (t[i] === '.') {
	      				e.classList.add(v);
	    			} else if (t[i] === '#') {
	      				e.setAttribute('id', v);
	    			}
	  			}
			});
			for (var a in attr) {
	            e.setAttribute(a, attr[a]);
	        }
	        if (txt) {
	        	e.appendChild(document.createTextNode(txt));
	        }
	        e.$ = e.querySelectorAll;
	        e.evt = function (ev, func) {
	    		this.addEventListener(ev, func);
				return this;
			};
			return e;
		}, $ = function (sel) {return document.querySelectorAll(sel)};

		/* embedded css */
		var css = t$('style', {type:'text/css'});
		$('head')[0].appendChild(css);
		css.textContent =
			'.nodep-dl-list {'+
				'border: solid #043A6B 1px;'+
				'position: absolute;'+
				'max-height: 420px;'+
				'z-index: 222;'+
				'opacity: 0.8;'+
				'background-color: #fff;'+
				'overflow: scroll;}\n'+
			'.nodep-dl-item {'+
				'font-family: sans-serif;'+
				'font-size: small;'+
				'padding: 3px;'+
				'-webkit-user-select: none;'+
				'-moz-user-select: none;'+
				'user-select: none;'+
				'cursor: default;}\n'+
			'.nodep-dl-item.nodep-dl-selected {'+
				'background-color: #043A6B;'+
				'color: #fff;}\n'+
			'.nodep-dl-visible {'+
				'display: block;}\n'+
			'.nodep-dl-hidden {'+
				'display: none;}\n';

		/* observer for dynamically inserted elements */
		var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;
		var observer = new MutationObserver(function (mut) {
			mut.forEach(function (m) {
				var n = m.addedNodes;
				for (var i=0; i<n.length; i++) {
					if (n[i] instanceof HTMLInputElement && n[i].hasAttribute('list')) {
						noDepDatalist(n[i]);
					}
				}
			})
		});
		/* wait until dom is loaded */
		document.addEventListener("DOMContentLoaded", function () {
			var n = $('input[list]');
			for (var i=0; i<n.length; i++) {
				if (n[i] instanceof HTMLInputElement && n[i].hasAttribute('list')) {
					noDepDatalist(n[i]);
				}
			}
			observer.observe(document.body, {childList: true});
		});
		/* global go-away click */
		window.addEventListener('click', function (evt) {
			if (! evt.target.classList.contains('nodep-dl-item')) {
				var q = document.querySelectorAll('.nodep-dl-list');
				for (var i=0; i<q.length; i++) {
					q[i].style.display = 'none';
				}
			}
		})
	}

	/* make the datalist popup */
	function noDepDatalist (inp) {
		if (!inp.evt) {
			inp.evt = function (ev, func) {
	    		this.addEventListener(ev, func);
				return this;
			};
		}
		var	iid = inp.getAttribute('list')
		 ,	list = $('#'+iid + ' option')
		 ,	w = inp.clientWidth
		 ,	l = inp.offsetLeft
		 ,	t = inp.offsetTop + inp.clientHeight + 4
		 ,	box = t$('div.nodep-dl-list', {style:'width: '+w+'px; left: '+l+'px; display: none; top:'+t+'px'})
		 ,	list = $('#'+iid + ' option');
		for (var i=0; i<list.length; i++) {
			var itm = t$('div.nodep-dl-item.nodep-dl-visible', null, list[i].value)
				.evt('click', function (evt) {
					evt.preventDefault();
					inp.value = evt.target.textContent;
					box.style.display = 'none';
				})
				.evt('mouseover', function (evt) {
					var sel = box.$('.nodep-dl-selected')[0];
					if (sel) {
						sel.classList.remove('nodep-dl-selected');
					}
					evt.target.classList.add('nodep-dl-selected');
				})
				.evt('mouseout', function (evt) {
					evt.target.classList.remove('nodep-dl-selected');
				})
			;
			box.appendChild(itm);
		}
		inp.parentNode.insertBefore(box, inp.nextSibling);

		/* event handlers */
		inp.evt('input', function () {
			box.style.display = '';
			var d = box.childNodes;

			for (var i=0; i<d.length; i++) {
				if (d[i].textContent.toUpperCase().indexOf(inp.value.toUpperCase()) > -1) {
					d[i].classList.add('nodep-dl-visible');
					d[i].classList.remove('nodep-dl-hidden');
				} else {
					d[i].classList.remove('nodep-dl-visible');
					d[i].classList.add('nodep-dl-hidden');
					d[i].classList.remove('nodep-dl-selected');
				}
			}
		})
		.evt('keydown', function (evt) {
			if (evt.keyCode === 40 || evt.keyCode === 38) {
				box.style.display = '';
				var vis = box.querySelectorAll('.nodep-dl-visible')
				 ,	vsel = -1
				 ,	sel = box.$('.nodep-dl-selected')
				 ,	s;
				if (sel.length === 1) {
					for (var i=0; i<vis.length; i++) {
						if (vis.item(i).classList.contains('nodep-dl-selected')) {
							vsel = i;
						}
					}
				}
				for (var i=0; i<sel.length; i++) {
					sel.item(i).classList.remove('nodep-dl-selected');
				}
				if (evt.keyCode === 40) {
					vsel = (vsel + 1) % vis.length;
				} else {
					vsel = vsel <= 0 ? vis.length : vsel - 1;
				}
				s = vis.item(vsel);
				if (s) {
					s.classList.add('nodep-dl-selected');
					s.scrollIntoView(false);
				}

			} else if (evt.keyCode === 9 || evt.keyCode === 10 || evt.keyCode === 13) {
				var sel = box.$('.nodep-dl-selected')[0];
				if (sel) {
					inp.value = sel.textContent;
					box.style.display = 'none';
				}
			}
		})
		// .evt('blur', function () {
		// 	box.style.display = 'none';
		// })
		.evt('dblclick', function () {
			box.style.display = '';
		});
	}

})();

