/*!
* MediaElement.js
* HTML5 <video> and <audio> shim and player
* http://mediaelementjs.com/
*
* Creates a JavaScript object that mimics HTML5 MediaElement API
* for browsers that don't understand HTML5 or can't play the provided codec
* Can play MP4 (H.264), Ogg, WebM, FLV, WMV, WMA, ACC, and MP3
*
* Copyright 2010-2011, John Dyer (http://j.hn)
* Dual licensed under the MIT or GPL Version 2 licenses.
*
*/var mejs=mejs||{};mejs.version="2.1.9";mejs.meIndex=0;mejs.plugins={silverlight:[{version:[3,0],types:["video/mp4","video/m4v","video/mov","video/wmv","audio/wma","audio/m4a","audio/mp3","audio/wav","audio/mpeg"]}],flash:[{version:[9,0,124],types:["video/mp4","video/m4v","video/mov","video/flv","video/x-flv","audio/flv","audio/x-flv","audio/mp3","audio/m4a","audio/mpeg"]}]};
mejs.Utility={encodeUrl:function(a){return encodeURIComponent(a)},escapeHTML:function(a){return a.toString().split("&").join("&amp;").split("<").join("&lt;").split('"').join("&quot;")},absolutizeUrl:function(a){var b=document.createElement("div");b.innerHTML='<a href="'+this.escapeHTML(a)+'">x</a>';return b.firstChild.href},getScriptPath:function(a){for(var b=0,c,d="",e="",f,g=document.getElementsByTagName("script");b<g.length;b++){f=g[b].src;for(c=0;c<a.length;c++){e=a[c];if(f.indexOf(e)>-1){d=f.substring(0,
f.indexOf(e));break}}if(d!=="")break}return d},secondsToTimeCode:function(a,b){a=Math.round(a);var c,d=Math.floor(a/60);if(d>=60){c=Math.floor(d/60);d%=60}c=c===undefined?"00":c>=10?c:"0"+c;d=d>=10?d:"0"+d;a=Math.floor(a%60);a=a>=10?a:"0"+a;return(c>0||b===true?c+":":"")+d+":"+a},timeCodeToSeconds:function(a){a=a.split(":");return a[0]*60*60+a[1]*60+parseFloat(a[2].replace(",","."))}};
mejs.PluginDetector={hasPluginVersion:function(a,b){var c=this.plugins[a];b[1]=b[1]||0;b[2]=b[2]||0;return c[0]>b[0]||c[0]==b[0]&&c[1]>b[1]||c[0]==b[0]&&c[1]==b[1]&&c[2]>=b[2]?true:false},nav:window.navigator,ua:window.navigator.userAgent.toLowerCase(),plugins:[],addPlugin:function(a,b,c,d,e){this.plugins[a]=this.detectPlugin(b,c,d,e)},detectPlugin:function(a,b,c,d){var e=[0,0,0],f;if(typeof this.nav.plugins!="undefined"&&typeof this.nav.plugins[a]=="object"){if((c=this.nav.plugins[a].description)&&
!(typeof this.nav.mimeTypes!="undefined"&&this.nav.mimeTypes[b]&&!this.nav.mimeTypes[b].enabledPlugin)){e=c.replace(a,"").replace(/^\s+/,"").replace(/\sr/gi,".").split(".");for(a=0;a<e.length;a++)e[a]=parseInt(e[a].match(/\d+/),10)}}else if(typeof window.ActiveXObject!="undefined")try{if(f=new ActiveXObject(c))e=d(f)}catch(g){}return e}};
mejs.PluginDetector.addPlugin("flash","Shockwave Flash","application/x-shockwave-flash","ShockwaveFlash.ShockwaveFlash",function(a){var b=[];if(a=a.GetVariable("$version")){a=a.split(" ")[1].split(",");b=[parseInt(a[0],10),parseInt(a[1],10),parseInt(a[2],10)]}return b});
mejs.PluginDetector.addPlugin("silverlight","Silverlight Plug-In","application/x-silverlight-2","AgControl.AgControl",function(a){var b=[0,0,0,0],c=function(d,e,f,g){for(;d.isVersionSupported(e[0]+"."+e[1]+"."+e[2]+"."+e[3]);)e[f]+=g;e[f]-=g};c(a,b,0,1);c(a,b,1,1);c(a,b,2,1E4);c(a,b,2,1E3);c(a,b,2,100);c(a,b,2,10);c(a,b,2,1);c(a,b,3,1);return b});
mejs.MediaFeatures={init:function(){var a=mejs.PluginDetector.nav,b=mejs.PluginDetector.ua.toLowerCase(),c,d=["source","track","audio","video"];this.isiPad=b.match(/ipad/i)!==null;this.isiPhone=b.match(/iphone/i)!==null;this.isAndroid=b.match(/android/i)!==null;this.isBustedAndroid=b.match(/android 2\.[12]/)!==null;this.isIE=a.appName.toLowerCase().indexOf("microsoft")!=-1;this.isChrome=b.match(/chrome/gi)!==null;this.isFirefox=b.match(/firefox/gi)!==null;for(a=0;a<d.length;a++)c=document.createElement(d[a]);
this.hasNativeFullScreen=typeof c.webkitRequestFullScreen!=="undefined";if(this.isChrome)this.hasNativeFullScreen=false;if(this.hasNativeFullScreen&&b.match(/mac os x 10_5/i))this.hasNativeFullScreen=false}};mejs.MediaFeatures.init();
mejs.HtmlMediaElement={pluginType:"native",isFullScreen:false,setCurrentTime:function(a){this.currentTime=a},setMuted:function(a){this.muted=a},setVolume:function(a){this.volume=a},stop:function(){this.pause()},setSrc:function(a){if(typeof a=="string")this.src=a;else{var b,c;for(b=0;b<a.length;b++){c=a[b];if(this.canPlayType(c.type))this.src=c.src}}},setVideoSize:function(a,b){this.width=a;this.height=b}};mejs.PluginMediaElement=function(a,b,c){this.id=a;this.pluginType=b;this.src=c;this.events={}};
mejs.PluginMediaElement.prototype={pluginElement:null,pluginType:"",isFullScreen:false,playbackRate:-1,defaultPlaybackRate:-1,seekable:[],played:[],paused:true,ended:false,seeking:false,duration:0,error:null,muted:false,volume:1,currentTime:0,play:function(){if(this.pluginApi!=null){this.pluginApi.playMedia();this.paused=false}},load:function(){if(this.pluginApi!=null){this.pluginApi.loadMedia();this.paused=false}},pause:function(){if(this.pluginApi!=null){this.pluginApi.pauseMedia();this.paused=
true}},stop:function(){if(this.pluginApi!=null){this.pluginApi.stopMedia();this.paused=true}},canPlayType:function(a){var b,c,d,e=mejs.plugins[this.pluginType];for(b=0;b<e.length;b++){d=e[b];if(mejs.PluginDetector.hasPluginVersion(this.pluginType,d.version))for(c=0;c<d.types.length;c++)if(a==d.types[c])return true}return false},setSrc:function(a){if(typeof a=="string"){this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(a));this.src=mejs.Utility.absolutizeUrl(a)}else{var b,c;for(b=0;b<a.length;b++){c=
a[b];if(this.canPlayType(c.type)){this.pluginApi.setSrc(mejs.Utility.absolutizeUrl(c.src));this.src=mejs.Utility.absolutizeUrl(a)}}}},setCurrentTime:function(a){if(this.pluginApi!=null){this.pluginApi.setCurrentTime(a);this.currentTime=a}},setVolume:function(a){if(this.pluginApi!=null){this.pluginApi.setVolume(a);this.volume=a}},setMuted:function(a){if(this.pluginApi!=null){this.pluginApi.setMuted(a);this.muted=a}},setVideoSize:function(a,b){if(this.pluginElement.style){this.pluginElement.style.width=
a+"px";this.pluginElement.style.height=b+"px"}this.pluginApi!=null&&this.pluginApi.setVideoSize(a,b)},setFullscreen:function(a){this.pluginApi!=null&&this.pluginApi.setFullscreen(a)},addEventListener:function(a,b){this.events[a]=this.events[a]||[];this.events[a].push(b)},removeEventListener:function(a,b){if(!a){this.events={};return true}var c=this.events[a];if(!c)return true;if(!b){this.events[a]=[];return true}for(i=0;i<c.length;i++)if(c[i]===b){this.events[a].splice(i,1);return true}return false},
dispatchEvent:function(a){var b,c,d=this.events[a];if(d){c=Array.prototype.slice.call(arguments,1);for(b=0;b<d.length;b++)d[b].apply(null,c)}}};
mejs.MediaPluginBridge={pluginMediaElements:{},htmlMediaElements:{},registerPluginElement:function(a,b,c){this.pluginMediaElements[a]=b;this.htmlMediaElements[a]=c},initPlugin:function(a){var b=this.pluginMediaElements[a],c=this.htmlMediaElements[a];switch(b.pluginType){case "flash":b.pluginElement=b.pluginApi=document.getElementById(a);break;case "silverlight":b.pluginElement=document.getElementById(b.id);b.pluginApi=b.pluginElement.Content.MediaElementJS}b.pluginApi!=null&&b.success&&b.success(b,
c)},fireEvent:function(a,b,c){var d,e;a=this.pluginMediaElements[a];a.ended=false;a.paused=true;b={type:b,target:a};for(d in c){a[d]=c[d];b[d]=c[d]}e=c.bufferedTime||0;b.target.buffered=b.buffered={start:function(){return 0},end:function(){return e},length:1};a.dispatchEvent(b.type,b)}};
mejs.MediaElementDefaults={mode:"auto",plugins:["flash","silverlight"],enablePluginDebug:false,type:"",pluginPath:mejs.Utility.getScriptPath(["mediaelement.js","mediaelement.min.js","mediaelement-and-player.js","mediaelement-and-player.min.js"]),flashName:"flashmediaelement.swf",enablePluginSmoothing:false,silverlightName:"silverlightmediaelement.xap",defaultVideoWidth:480,defaultVideoHeight:270,pluginWidth:-1,pluginHeight:-1,timerRate:250,success:function(){},error:function(){}};
mejs.MediaElement=function(a,b){return mejs.HtmlMediaElementShim.create(a,b)};
mejs.HtmlMediaElementShim={create:function(a,b){var c=mejs.MediaElementDefaults,d=typeof a=="string"?document.getElementById(a):a,e=d.tagName.toLowerCase()=="video",f=typeof d.canPlayType!="undefined",g={method:"",url:""},k=d.getAttribute("poster"),h=d.getAttribute("autoplay"),l=d.getAttribute("preload"),j=d.getAttribute("controls"),m;for(m in b)c[m]=b[m];k=typeof k=="undefined"||k===null?"":k;l=typeof l=="undefined"||l===null||l==="false"?"none":l;h=!(typeof h=="undefined"||h===null||h==="false");
j=!(typeof j=="undefined"||j===null||j==="false");g=this.determinePlayback(d,c,e,f);if(g.method=="native"){if(mejs.MediaFeatures.isBustedAndroid){d.src=g.url;d.addEventListener("click",function(){d.play()},true)}return this.updateNative(d,c,h,l,g)}else if(g.method!=="")return this.createPlugin(d,c,e,g.method,g.url!==null?mejs.Utility.absolutizeUrl(g.url):"",k,h,l,j);else this.createErrorMessage(d,c,g.url!==null?mejs.Utility.absolutizeUrl(g.url):"",k)},determinePlayback:function(a,b,c,d){var e=[],
f,g,k={method:"",url:""},h=a.getAttribute("src"),l,j;if(h=="undefined"||h==""||h===null)h=null;if(typeof b.type!="undefined"&&b.type!=="")e.push({type:b.type,url:h});else if(h!==null){g=this.checkType(h,a.getAttribute("type"),c);e.push({type:g,url:h})}else for(f=0;f<a.childNodes.length;f++){g=a.childNodes[f];if(g.nodeType==1&&g.tagName.toLowerCase()=="source"){h=g.getAttribute("src");g=this.checkType(h,g.getAttribute("type"),c);e.push({type:g,url:h})}}if(mejs.MediaFeatures.isBustedAndroid)a.canPlayType=
function(m){return m.match(/video\/(mp4|m4v)/gi)!==null?"maybe":""};if(d&&(b.mode==="auto"||b.mode==="native"))for(f=0;f<e.length;f++)if(a.canPlayType(e[f].type).replace(/no/,"")!==""||a.canPlayType(e[f].type.replace(/mp3/,"mpeg")).replace(/no/,"")!==""){k.method="native";k.url=e[f].url;return k}if(b.mode==="auto"||b.mode==="shim")for(f=0;f<e.length;f++){g=e[f].type;for(a=0;a<b.plugins.length;a++){h=b.plugins[a];l=mejs.plugins[h];for(c=0;c<l.length;c++){j=l[c];if(mejs.PluginDetector.hasPluginVersion(h,
j.version))for(d=0;d<j.types.length;d++)if(g==j.types[d]){k.method=h;k.url=e[f].url;return k}}}}if(k.method==="")k.url=e[0].url;return k},checkType:function(a,b,c){if(a&&!b){a=a.substring(a.lastIndexOf(".")+1);return(c?"video":"audio")+"/"+a}else return b&&~b.indexOf(";")?b.substr(0,b.indexOf(";")):b},createErrorMessage:function(a,b,c,d){var e=document.createElement("div");e.className="me-cannotplay";try{e.style.width=a.width+"px";e.style.height=a.height+"px"}catch(f){}e.innerHTML=d!==""?'<a href="'+
c+'"><img src="'+d+'" /></a>':'<a href="'+c+'"><span>Download File</span></a>';a.parentNode.insertBefore(e,a);a.style.display="none";b.error(a)},createPlugin:function(a,b,c,d,e,f,g,k,h){var l=f=1,j="me_"+d+"_"+mejs.meIndex++,m=new mejs.PluginMediaElement(j,d,e),o=document.createElement("div"),n;for(n=a.parentNode;n!==null&&n.tagName.toLowerCase()!="body";){if(n.parentNode.tagName.toLowerCase()=="p"){n.parentNode.parentNode.insertBefore(n,n.parentNode);break}n=n.parentNode}if(c){f=b.videoWidth>0?b.videoWidth:
a.getAttribute("width")!==null?a.getAttribute("width"):b.defaultVideoWidth;l=b.videoHeight>0?b.videoHeight:a.getAttribute("height")!==null?a.getAttribute("height"):b.defaultVideoHeight}else if(b.enablePluginDebug){f=320;l=240}m.success=b.success;mejs.MediaPluginBridge.registerPluginElement(j,m,a);o.className="me-plugin";a.parentNode.insertBefore(o,a);c=["id="+j,"isvideo="+(c?"true":"false"),"autoplay="+(g?"true":"false"),"preload="+k,"width="+f,"startvolume="+b.startVolume,"timerrate="+b.timerRate,
"height="+l];if(e!==null)d=="flash"?c.push("file="+mejs.Utility.encodeUrl(e)):c.push("file="+e);b.enablePluginDebug&&c.push("debug=true");b.enablePluginSmoothing&&c.push("smoothing=true");h&&c.push("controls=true");switch(d){case "silverlight":o.innerHTML='<object data="data:application/x-silverlight-2," type="application/x-silverlight-2" id="'+j+'" name="'+j+'" width="'+f+'" height="'+l+'"><param name="initParams" value="'+c.join(",")+'" /><param name="windowless" value="true" /><param name="background" value="black" /><param name="minRuntimeVersion" value="3.0.0.0" /><param name="autoUpgrade" value="true" /><param name="source" value="'+
b.pluginPath+b.silverlightName+'" /></object>';break;case "flash":if(mejs.MediaFeatures.isIE){d=document.createElement("div");o.appendChild(d);d.outerHTML='<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000" codebase="http://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab" id="'+j+'" width="'+f+'" height="'+l+'"><param name="movie" value="'+b.pluginPath+b.flashName+"?x="+new Date+'" /><param name="flashvars" value="'+c.join("&amp;")+'" /><param name="quality" value="high" /><param name="bgcolor" value="#000000" /><param name="wmode" value="transparent" /><param name="allowScriptAccess" value="always" /><param name="allowFullScreen" value="true" /></object>'}else o.innerHTML=
'<embed id="'+j+'" name="'+j+'" play="true" loop="false" quality="high" bgcolor="#000000" wmode="transparent" allowScriptAccess="always" allowFullScreen="true" type="application/x-shockwave-flash" pluginspage="http://www.macromedia.com/go/getflashplayer" src="'+b.pluginPath+b.flashName+'" flashvars="'+c.join("&")+'" width="'+f+'" height="'+l+'"></embed>'}a.style.display="none";return m},updateNative:function(a,b){for(var c in mejs.HtmlMediaElement)a[c]=mejs.HtmlMediaElement[c];b.success(a,a);return a}};
window.mejs=mejs;window.MediaElement=mejs.MediaElement;

/*!
 * MediaElementPlayer
 * http://mediaelementjs.com/
 *
 * Creates a controller bar for HTML5 <video> add <audio> tags
 * using jQuery and MediaElement.js (HTML5 Flash/Silverlight wrapper)
 *
 * Copyright 2010-2011, John Dyer (http://j.hn/)
 * Dual licensed under the MIT or GPL Version 2 licenses.
 *
 */if(typeof WDN.jQuery!="undefined")mejs.$=WDN.jQuery;else if(typeof ender!="undefined")mejs.$=ender;
(function(f){mejs.MepDefaults={poster:"",defaultVideoWidth:480,defaultVideoHeight:270,videoWidth:-1,videoHeight:-1,audioWidth:400,audioHeight:30,startVolume:0.8,loop:false,enableAutosize:true,alwaysShowHours:false,alwaysShowControls:false,iPadUseNativeControls:true,features:["playpause","current","progress","duration","tracks","volume","fullscreen"]};mejs.mepIndex=0;mejs.MediaElementPlayer=function(a,c){if(!(this instanceof mejs.MediaElementPlayer))return new mejs.MediaElementPlayer(a,c);this.options=
f.extend({},mejs.MepDefaults,c);this.$media=this.$node=f(a);this.node=this.media=this.$media[0];if(typeof this.node.player!="undefined")return this.node.player;else this.node.player=this;this.isVideo=this.media.tagName.toLowerCase()==="video";this.init();return this};mejs.MediaElementPlayer.prototype={init:function(){var a=this,c=mejs.MediaFeatures,b=f.extend(true,{},a.options,{success:function(d,e){a.meReady(d,e)},error:function(d){a.handleError(d)}});if(c.isiPad&&a.options.iPadUseNativeControls||
c.isiPhone){a.$media.attr("controls","controls");a.$media.removeAttr("poster");if(c.isiPad&&a.media.getAttribute("autoplay")!==null){a.media.load();a.media.play()}}else if(!(c.isAndroid&&a.isVideo)){a.$media.removeAttr("controls");a.id="mep_"+mejs.mepIndex++;a.container=f('<div id="'+a.id+'" class="mejs-container"><div class="mejs-inner"><div class="mejs-mediaelement"></div><div class="mejs-layers"></div><div class="mejs-controls"></div><div class="mejs-clear"></div></div></div>').addClass(a.$media[0].className).insertBefore(a.$media);
a.container.find(".mejs-mediaelement").append(a.$media);a.controls=a.container.find(".mejs-controls");a.layers=a.container.find(".mejs-layers");if(a.isVideo){a.width=a.options.videoWidth>0?a.options.videoWidth:a.$media[0].getAttribute("width")!==null?a.$media.attr("width"):a.options.defaultVideoWidth;a.height=a.options.videoHeight>0?a.options.videoHeight:a.$media[0].getAttribute("height")!==null?a.$media.attr("height"):a.options.defaultVideoHeight}else{a.width=a.options.audioWidth;a.height=a.options.audioHeight}a.setPlayerSize(a.width,
a.height);b.pluginWidth=a.height;b.pluginHeight=a.width}mejs.MediaElement(a.$media[0],b)},meReady:function(a,c){var b=this,d=mejs.MediaFeatures,e;if(!b.created){b.created=true;b.media=a;b.domNode=c;if(!d.isiPhone&&!d.isAndroid&&!(d.isiPad&&b.options.iPadUseNativeControls)){b.buildposter(b,b.controls,b.layers,b.media);b.buildoverlays(b,b.controls,b.layers,b.media);b.findTracks();for(e in b.options.features){d=b.options.features[e];if(b["build"+d])try{b["build"+d](b,b.controls,b.layers,b.media)}catch(g){}}b.container.trigger("controlsready");
b.setPlayerSize(b.width,b.height);b.setControlsSize();if(b.isVideo){b.container.bind("mouseenter",function(){if(!b.options.alwaysShowControls){b.controls.css("visibility","visible");b.controls.stop(true,true).fadeIn(200)}}).bind("mouseleave",function(){!b.media.paused&&!b.options.alwaysShowControls&&b.controls.stop(true,true).fadeOut(200,function(){f(this).css("visibility","hidden");f(this).css("display","block")})});b.domNode.getAttribute("autoplay")!==null&&!b.options.alwaysShowControls&&b.controls.css("visibility",
"hidden");b.options.enableAutosize&&b.media.addEventListener("loadedmetadata",function(h){if(b.options.videoHeight<=0&&b.domNode.getAttribute("height")===null&&!isNaN(h.target.videoHeight)){b.setPlayerSize(h.target.videoWidth,h.target.videoHeight);b.setControlsSize();b.media.setVideoSize(h.target.videoWidth,h.target.videoHeight)}},false)}b.media.addEventListener("ended",function(){b.media.setCurrentTime(0);b.media.pause();b.setProgressRail&&b.setProgressRail();b.setCurrentRail&&b.setCurrentRail();
if(b.options.loop)b.media.play();else b.options.alwaysShowControls||b.controls.css("visibility","visible")},true);b.media.addEventListener("loadedmetadata",function(){b.updateDuration&&b.updateDuration();b.updateCurrent&&b.updateCurrent();b.setControlsSize()},true);setTimeout(function(){b.setControlsSize();b.setPlayerSize(b.width,b.height)},50)}b.options.success&&b.options.success(b.media,b.domNode)}},handleError:function(a){this.options.error&&this.options.error(a)},setPlayerSize:function(a,c){this.width=
parseInt(a,10);this.height=parseInt(c,10);this.container.width(this.width).height(this.height);this.layers.children(".mejs-layer").width(this.width).height(this.height)},setControlsSize:function(){var a=0,c=0,b=this.controls.find(".mejs-time-rail"),d=this.controls.find(".mejs-time-total");this.controls.find(".mejs-time-current");this.controls.find(".mejs-time-loaded");others=b.siblings();others.each(function(){if(f(this).css("position")!="absolute")a+=f(this).outerWidth(true)});c=this.controls.width()-
a-(b.outerWidth(true)-b.outerWidth(false));b.width(c);d.width(c-(d.outerWidth(true)-d.width()));this.setProgressRail&&this.setProgressRail();this.setCurrentRail&&this.setCurrentRail()},buildposter:function(a,c,b,d){var e=f('<div class="mejs-poster mejs-layer"><img /></div>').appendTo(b);c=a.$media.attr("poster");b=e.find("img").width(a.width).height(a.height);if(a.options.poster!="")b.attr("src",a.options.poster);else c!==""&&c!=null?b.attr("src",c):e.remove();d.addEventListener("play",function(){e.hide()},
false)},buildoverlays:function(a,c,b,d){if(a.isVideo){var e=f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-loading"><span></span></div></div>').hide().appendTo(b),g=f('<div class="mejs-overlay mejs-layer"><div class="mejs-overlay-error"></div></div>').hide().appendTo(b),h=f('<div class="mejs-overlay mejs-layer mejs-overlay-play"><div class="mejs-overlay-button"></div></div>').appendTo(b).click(function(){d.paused?d.play():d.pause()});d.addEventListener("play",function(){h.hide();
g.hide()},false);d.addEventListener("pause",function(){h.show()},false);d.addEventListener("loadstart",function(){mejs.MediaFeatures.isChrome&&d.getAttribute&&d.getAttribute("preload")==="none"||e.show()},false);d.addEventListener("canplay",function(){e.hide()},false);d.addEventListener("error",function(){e.hide();g.show();g.find("mejs-overlay-error").html("Error loading this resource")},false)}},findTracks:function(){var a=this,c=a.$media.find("track");a.tracks=[];c.each(function(){a.tracks.push({srclang:f(this).attr("srclang").toLowerCase(),
src:f(this).attr("src"),kind:f(this).attr("kind"),entries:[],isLoaded:false})})},changeSkin:function(a){this.container[0].className="mejs-container "+a;this.setPlayerSize();this.setControlsSize()},play:function(){this.media.play()},pause:function(){this.media.pause()},load:function(){this.media.load()},setMuted:function(a){this.media.setMuted(a)},setCurrentTime:function(a){this.media.setCurrentTime(a)},getCurrentTime:function(){return this.media.currentTime},setVolume:function(a){this.media.setVolume(a)},
getVolume:function(){return this.media.volume},setSrc:function(a){this.media.setSrc(a)}};if(typeof WDN.jQuery!="undefined")WDN.jQuery.fn.mediaelementplayer=function(a){return this.each(function(){new mejs.MediaElementPlayer(this,a)})};window.MediaElementPlayer=mejs.MediaElementPlayer})(mejs.$);
(function(f){MediaElementPlayer.prototype.buildplaypause=function(a,c,b,d){var e=f('<div class="mejs-button mejs-playpause-button mejs-play" type="button"><button type="button"></button></div>').appendTo(c).click(function(g){g.preventDefault();d.paused?d.play():d.pause();return false});d.addEventListener("play",function(){e.removeClass("mejs-play").addClass("mejs-pause")},false);d.addEventListener("playing",function(){e.removeClass("mejs-play").addClass("mejs-pause")},false);d.addEventListener("pause",
function(){e.removeClass("mejs-pause").addClass("mejs-play")},false);d.addEventListener("paused",function(){e.removeClass("mejs-pause").addClass("mejs-play")},false)}})(mejs.$);
(function(f){MediaElementPlayer.prototype.buildstop=function(a,c,b,d){f('<div class="mejs-button mejs-stop-button mejs-stop"><button type="button"></button></div>').appendTo(c).click(function(){d.paused||d.pause();if(d.currentTime>0){d.setCurrentTime(0);c.find(".mejs-time-current").width("0px");c.find(".mejs-time-handle").css("left","0px");c.find(".mejs-time-float-current").html(mejs.Utility.secondsToTimeCode(0));c.find(".mejs-currenttime").html(mejs.Utility.secondsToTimeCode(0));b.find(".mejs-poster").show()}})}})(mejs.$);
(function(f){MediaElementPlayer.prototype.buildprogress=function(a,c,b,d){f('<div class="mejs-time-rail"><span class="mejs-time-total"><span class="mejs-time-loaded"></span><span class="mejs-time-current"></span><span class="mejs-time-handle"></span><span class="mejs-time-float"><span class="mejs-time-float-current">00:00</span><span class="mejs-time-float-corner"></span></span></span></div>').appendTo(c);var e=c.find(".mejs-time-total");b=c.find(".mejs-time-loaded");var g=c.find(".mejs-time-current"),
h=c.find(".mejs-time-handle"),j=c.find(".mejs-time-float"),l=c.find(".mejs-time-float-current"),o=function(k){k=k.pageX;var n=e.offset(),q=e.outerWidth(),p=0;p=0;if(k>n.left&&k<=q+n.left&&d.duration){p=(k-n.left)/q;p=p<=0.02?0:p*d.duration;m&&d.setCurrentTime(p);j.css("left",k-n.left);l.html(mejs.Utility.secondsToTimeCode(p))}},m=false,i=false;e.bind("mousedown",function(k){m=true;o(k);return false});c.find(".mejs-time-rail").bind("mouseenter",function(){i=true}).bind("mouseleave",function(){i=false});
f(document).bind("mouseup",function(){m=false}).bind("mousemove",function(k){if(m||i)o(k)});d.addEventListener("progress",function(k){a.setProgressRail(k);a.setCurrentRail(k)},false);d.addEventListener("timeupdate",function(k){a.setProgressRail(k);a.setCurrentRail(k)},false);this.loaded=b;this.total=e;this.current=g;this.handle=h};MediaElementPlayer.prototype.setProgressRail=function(a){var c=a!=undefined?a.target:this.media,b=null;if(c&&c.buffered&&c.buffered.length>0&&c.buffered.end&&c.duration)b=
c.buffered.end(0)/c.duration;else if(c&&c.bytesTotal!=undefined&&c.bytesTotal>0&&c.bufferedBytes!=undefined)b=c.bufferedBytes/c.bytesTotal;else if(a&&a.lengthComputable&&a.total!=0)b=a.loaded/a.total;if(b!==null){b=Math.min(1,Math.max(0,b));this.loaded&&this.total&&this.loaded.width(this.total.width()*b)}};MediaElementPlayer.prototype.setCurrentRail=function(){if(this.media.currentTime!=undefined&&this.media.duration)if(this.total&&this.handle){var a=this.total.width()*this.media.currentTime/this.media.duration,
c=a-this.handle.outerWidth(true)/2;this.current.width(a);this.handle.css("left",c)}}})(mejs.$);
(function(f){MediaElementPlayer.prototype.buildcurrent=function(a,c,b,d){f('<div class="mejs-time"><span class="mejs-currenttime">'+(a.options.alwaysShowHours?"00:":"")+"00:00</span></div>").appendTo(c);this.currenttime=this.controls.find(".mejs-currenttime");d.addEventListener("timeupdate",function(){a.updateCurrent()},false)};MediaElementPlayer.prototype.buildduration=function(a,c,b,d){if(c.children().last().find(".mejs-currenttime").length>0)f(' <span> | </span> <span class="mejs-duration">'+(a.options.alwaysShowHours?
"00:":"")+"00:00</span>").appendTo(c.find(".mejs-time"));else{c.find(".mejs-currenttime").parent().addClass("mejs-currenttime-container");f('<div class="mejs-time mejs-duration-container"><span class="mejs-duration">'+(a.options.alwaysShowHours?"00:":"")+"00:00</span></div>").appendTo(c)}this.durationD=this.controls.find(".mejs-duration");d.addEventListener("timeupdate",function(){a.updateDuration()},false)};MediaElementPlayer.prototype.updateCurrent=function(){if(this.currenttime)this.currenttime.html(mejs.Utility.secondsToTimeCode(this.media.currentTime|
0,this.options.alwaysShowHours||this.media.duration>3600))};MediaElementPlayer.prototype.updateDuration=function(){this.media.duration&&this.durationD&&this.durationD.html(mejs.Utility.secondsToTimeCode(this.media.duration,this.options.alwaysShowHours))}})(mejs.$);
(function(f){MediaElementPlayer.prototype.buildvolume=function(a,c,b,d){var e=f('<div class="mejs-button mejs-volume-button mejs-mute"><button type="button"></button><div class="mejs-volume-slider"><div class="mejs-volume-total"></div><div class="mejs-volume-current"></div><div class="mejs-volume-handle"></div></div></div>').appendTo(c);c=e.find(".mejs-volume-slider");var g=e.find(".mejs-volume-total"),h=e.find(".mejs-volume-current"),j=e.find(".mejs-volume-handle"),l=function(i){i=g.height()-g.height()*
i;j.css("top",i-j.height()/2);h.height(g.height()-i+parseInt(g.css("top").replace(/px/,""),10));h.css("top",i)},o=function(i){var k=g.height(),n=g.offset(),q=parseInt(g.css("top").replace(/px/,""),10);i=i.pageY-n.top;n=(k-i)/k;if(i<0)i=0;else if(i>k)i=k;j.css("top",i-j.height()/2+q);h.height(k-i);h.css("top",i+q);if(n==0){d.setMuted(true);e.removeClass("mejs-mute").addClass("mejs-unmute")}else{d.setMuted(false);e.removeClass("mejs-unmute").addClass("mejs-mute")}n=Math.max(0,n);n=Math.min(n,1);d.setVolume(n)},
m=false;c.bind("mousedown",function(i){o(i);m=true;return false});f(document).bind("mouseup",function(){m=false}).bind("mousemove",function(i){m&&o(i)});e.find("button").click(function(){if(d.muted){d.setMuted(false);e.removeClass("mejs-unmute").addClass("mejs-mute");l(1)}else{d.setMuted(true);e.removeClass("mejs-mute").addClass("mejs-unmute");l(0)}});d.addEventListener("volumechange",function(i){m||l(i.target.volume)},true);l(a.options.startVolume);d.pluginType==="native"&&d.setVolume(a.options.startVolume)}})(mejs.$);
(function(f){mejs.MediaElementDefaults.forcePluginFullScreen=false;MediaElementPlayer.prototype.isFullScreen=false;MediaElementPlayer.prototype.buildfullscreen=function(a,c,b,d){if(a.isVideo){mejs.MediaFeatures.hasNativeFullScreen&&a.container.bind("webkitfullscreenchange",function(){document.webkitIsFullScreen?a.setControlsSize():a.exitFullScreen()});var e=0,g=0,h=a.container,j=document.documentElement,l,o=f('<div class="mejs-button mejs-fullscreen-button"><button type="button"></button></div>').appendTo(c).click(function(){(mejs.MediaFeatures.hasNativeFullScreen?
document.webkitIsFullScreen:a.isFullScreen)?a.exitFullScreen():a.enterFullScreen()});a.enterFullScreen=function(){if(a.pluginType!=="native"&&(mejs.MediaFeatures.isFirefox||a.options.forcePluginFullScreen))d.setFullscreen(true);else{mejs.MediaFeatures.hasNativeFullScreen&&a.container[0].webkitRequestFullScreen();l=j.style.overflow;j.style.overflow="hidden";e=a.container.height();g=a.container.width();h.addClass("mejs-container-fullscreen").width("100%").height("100%").css("z-index",1E3);if(a.pluginType===
"native")a.$media.width("100%").height("100%");else{h.find("object embed").width("100%").height("100%");a.media.setVideoSize(f(window).width(),f(window).height())}b.children("div").width("100%").height("100%");o.removeClass("mejs-fullscreen").addClass("mejs-unfullscreen");a.setControlsSize();a.isFullScreen=true}};a.exitFullScreen=function(){if(a.pluginType!=="native"&&mejs.MediaFeatures.isFirefox)d.setFullscreen(false);else{mejs.MediaFeatures.hasNativeFullScreen&&document.webkitIsFullScreen&&document.webkitCancelFullScreen();
j.style.overflow=l;h.removeClass("mejs-container-fullscreen").width(g).height(e).css("z-index",1);if(a.pluginType==="native")a.$media.width(g).height(e);else{h.find("object embed").width(g).height(e);a.media.setVideoSize(g,e)}b.children("div").width(g).height(e);o.removeClass("mejs-unfullscreen").addClass("mejs-fullscreen");a.setControlsSize();a.isFullScreen=false}};f(window).bind("resize",function(){a.setControlsSize()});f(document).bind("keydown",function(m){a.isFullScreen&&m.keyCode==27&&a.exitFullScreen()})}}})(mejs.$);
(function(f){f.extend(mejs.MepDefaults,{startLanguage:"",translations:[],translationSelector:false,googleApiKey:""});f.extend(MediaElementPlayer.prototype,{buildtracks:function(a,c,b,d){if(a.isVideo)if(a.tracks.length!=0){var e,g="";a.chapters=f('<div class="mejs-chapters mejs-layer"></div>').prependTo(b).hide();a.captions=f('<div class="mejs-captions-layer mejs-layer"><div class="mejs-captions-position"><span class="mejs-captions-text"></span></div></div>').prependTo(b).hide();a.captionsText=a.captions.find(".mejs-captions-text");
a.captionsButton=f('<div class="mejs-button mejs-captions-button"><button type="button" ></button><div class="mejs-captions-selector"><ul><li><input type="radio" name="'+a.id+'_captions" id="'+a.id+'_captions_none" value="none" checked="checked" /><label for="'+a.id+'_captions_none">None</label></li></ul></div></button>').appendTo(c).delegate("input[type=radio]","click",function(){lang=this.value;if(lang=="none")a.selectedTrack=null;else for(e=0;e<a.tracks.length;e++)if(a.tracks[e].srclang==lang){a.selectedTrack=
a.tracks[e];a.captions.attr("lang",a.selectedTrack.srclang);a.displayCaptions();break}});a.options.alwaysShowControls?a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover"):a.container.bind("mouseenter",function(){a.container.find(".mejs-captions-position").addClass("mejs-captions-position-hover")}).bind("mouseleave",function(){d.paused||a.container.find(".mejs-captions-position").removeClass("mejs-captions-position-hover")});a.trackToLoad=-1;a.selectedTrack=null;a.isLoadingTrack=
false;if(a.tracks.length>0&&a.options.translations.length>0)for(e=0;e<a.options.translations.length;e++)a.tracks.push({srclang:a.options.translations[e].toLowerCase(),src:null,kind:"subtitles",entries:[],isLoaded:false,isTranslation:true});for(e=0;e<a.tracks.length;e++)a.tracks[e].kind=="subtitles"&&a.addTrackButton(a.tracks[e].srclang,a.tracks[e].isTranslation);a.loadNextTrack();d.addEventListener("timeupdate",function(){a.displayCaptions()},false);d.addEventListener("loadedmetadata",function(){a.displayChapters()},
false);a.container.hover(function(){a.chapters.css("visibility","visible");a.chapters.fadeIn(200)},function(){d.paused||a.chapters.fadeOut(200,function(){f(this).css("visibility","hidden");f(this).css("display","block")})});a.node.getAttribute("autoplay")!==null&&a.chapters.css("visibility","hidden");if(a.options.translationSelector){for(e in mejs.language.codes)g+='<option value="'+e+'">'+mejs.language.codes[e]+"</option>";a.container.find(".mejs-captions-selector ul").before(f('<select class="mejs-captions-translations"><option value="">--Add Translation--</option>'+
g+"</select>"));a.container.find(".mejs-captions-translations").change(function(){lang=f(this).val();if(lang!=""){a.tracks.push({srclang:lang,src:null,entries:[],isLoaded:false,isTranslation:true});if(!a.isLoadingTrack){a.trackToLoad--;a.addTrackButton(lang,true);a.options.startLanguage=lang;a.loadNextTrack()}}})}}},loadNextTrack:function(){this.trackToLoad++;if(this.trackToLoad<this.tracks.length){this.isLoadingTrack=true;this.loadTrack(this.trackToLoad)}else this.isLoadingTrack=false},loadTrack:function(a){var c=
this,b=c.tracks[a],d=function(){b.isLoaded=true;c.enableTrackButton(b.srclang);c.loadNextTrack()};b.isTranslation?mejs.TrackFormatParser.translateTrackText(c.tracks[0].entries,c.tracks[0].srclang,b.srclang,c.options.googleApiKey,function(e){b.entries=e;d()}):f.ajax({url:b.src,success:function(e){b.entries=mejs.TrackFormatParser.parse(e);d();b.kind=="chapters"&&c.media.duration>0&&c.drawChapters(b)},error:function(){c.loadNextTrack()}})},enableTrackButton:function(a){this.captionsButton.find("input[value="+
a+"]").prop("disabled",false).siblings("label").html(mejs.language.codes[a]||a);this.options.startLanguage==a&&f("#"+this.id+"_captions_"+a).click();this.adjustLanguageBox()},addTrackButton:function(a,c){var b=mejs.language.codes[a]||a;this.captionsButton.find("ul").append(f('<li><input type="radio" name="'+this.id+'_captions" id="'+this.id+"_captions_"+a+'" value="'+a+'" disabled="disabled" /><label for="'+this.id+"_captions_"+a+'">'+b+(c?" (translating)":" (loading)")+"</label></li>"));this.adjustLanguageBox();
this.container.find(".mejs-captions-translations option[value="+a+"]").remove()},adjustLanguageBox:function(){this.captionsButton.find(".mejs-captions-selector").height(this.captionsButton.find(".mejs-captions-selector ul").outerHeight(true)+this.captionsButton.find(".mejs-captions-translations").outerHeight(true))},displayCaptions:function(){if(typeof this.tracks!="undefined"){var a,c=this.selectedTrack;if(c!=null&&c.isLoaded)for(a=0;a<c.entries.times.length;a++)if(this.media.currentTime>=c.entries.times[a].start&&
this.media.currentTime<=c.entries.times[a].stop){this.captionsText.html(c.entries.text[a]);this.captions.show();return}this.captions.hide()}},displayChapters:function(){var a;for(a=0;a<this.tracks.length;a++)if(this.tracks[a].kind=="chapters"&&this.tracks[a].isLoaded){this.drawChapters(this.tracks[a]);break}},drawChapters:function(a){var c=this,b,d,e=d=0;c.chapters.empty();for(b=0;b<a.entries.times.length;b++){d=a.entries.times[b].stop-a.entries.times[b].start;d=Math.floor(d/c.media.duration*100);
if(d+e>100||b==a.entries.times.length-1&&d+e<100)d=100-e;c.chapters.append(f('<div class="mejs-chapter" rel="'+a.entries.times[b].start+'" style="left: '+e.toString()+"%;width: "+d.toString()+'%;"><div class="mejs-chapter-block'+(b==a.entries.times.length-1?" mejs-chapter-block-last":"")+'"><span class="ch-title">'+a.entries.text[b]+'</span><span class="ch-time">'+mejs.Utility.secondsToTimeCode(a.entries.times[b].start)+"&ndash;"+mejs.Utility.secondsToTimeCode(a.entries.times[b].stop)+"</span></div></div>"));
e+=d}c.chapters.find("div.mejs-chapter").click(function(){c.media.setCurrentTime(parseFloat(f(this).attr("rel")));c.media.paused&&c.media.play()});c.chapters.show()}});mejs.language={codes:{af:"Afrikaans",sq:"Albanian",ar:"Arabic",be:"Belarusian",bg:"Bulgarian",ca:"Catalan",zh:"Chinese","zh-cn":"Chinese Simplified","zh-tw":"Chinese Traditional",hr:"Croatian",cs:"Czech",da:"Danish",nl:"Dutch",en:"English",et:"Estonian",tl:"Filipino",fi:"Finnish",fr:"French",gl:"Galician",de:"German",el:"Greek",ht:"Haitian Creole",
iw:"Hebrew",hi:"Hindi",hu:"Hungarian",is:"Icelandic",id:"Indonesian",ga:"Irish",it:"Italian",ja:"Japanese",ko:"Korean",lv:"Latvian",lt:"Lithuanian",mk:"Macedonian",ms:"Malay",mt:"Maltese",no:"Norwegian",fa:"Persian",pl:"Polish",pt:"Portuguese",ro:"Romanian",ru:"Russian",sr:"Serbian",sk:"Slovak",sl:"Slovenian",es:"Spanish",sw:"Swahili",sv:"Swedish",tl:"Tagalog",th:"Thai",tr:"Turkish",uk:"Ukrainian",vi:"Vietnamese",cy:"Welsh",yi:"Yiddish"}};mejs.TrackFormatParser={pattern_identifier:/^[0-9]+$/,pattern_timecode:/^([0-9]{2}:[0-9]{2}:[0-9]{2}(,[0-9]{1,3})?) --\> ([0-9]{2}:[0-9]{2}:[0-9]{2}(,[0-9]{3})?)(.*)$/,
split2:function(a,c){return a.split(c)},parse:function(a){var c=0;a=this.split2(a,/\r?\n/);for(var b={text:[],times:[]},d,e;c<a.length;c++)if(this.pattern_identifier.exec(a[c])){c++;if((d=this.pattern_timecode.exec(a[c]))&&c<a.length){c++;e=a[c];for(c++;a[c]!==""&&c<a.length;){e=e+"\n"+a[c];c++}b.text.push(e);b.times.push({start:mejs.Utility.timeCodeToSeconds(d[1]),stop:mejs.Utility.timeCodeToSeconds(d[3]),settings:d[5]})}}return b},translateTrackText:function(a,c,b,d,e){var g={text:[],times:[]},
h,j;this.translateText(a.text.join(" <a></a>"),c,b,d,function(l){h=l.split("<a></a>");for(j=0;j<a.text.length;j++){g.text[j]=h[j];g.times[j]={start:a.times[j].start,stop:a.times[j].stop,settings:a.times[j].settings}}e(g)})},translateText:function(a,c,b,d,e){for(var g,h=[],j,l="",o=function(){if(h.length>0){j=h.shift();mejs.TrackFormatParser.translateChunk(j,c,b,d,function(m){if(m!="undefined")l+=m;o()})}else e(l)};a.length>0;)if(a.length>1E3){g=a.lastIndexOf(".",1E3);h.push(a.substring(0,g));a=a.substring(g+
1)}else{h.push(a);a=""}o()},translateChunk:function(a,c,b,d,e){a={q:a,langpair:c+"|"+b,v:"1.0"};if(d!==""&&d!==null)a.key=d;f.ajax({url:"https://ajax.googleapis.com/ajax/services/language/translate",data:a,type:"GET",dataType:"jsonp",success:function(g){e(g.responseData.translatedText)},error:function(){e(null)}})}};if("x\n\ny".split(/\n/gi).length!=3)mejs.TrackFormatParser.split2=function(a,c){var b=[],d="",e;for(e=0;e<a.length;e++){d+=a.substring(e,e+1);if(c.test(d)){b.push(d.replace(c,""));d=""}}b.push(d);
return b}})(mejs.$);

