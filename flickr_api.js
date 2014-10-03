/*
By Ariana Giorgi
UI Design Assignment 1
JS Code for Flickr API Interface using NPM
https://www.npmjs.org/package/flickrapi

10-2-2014
*/

//set up flickr instance
var flickr = new Flickr({
	api_key:"e1fbeb4903b9ccd5a99f210d3caeff0c",
	secret: "f423c65e5270f45e"
});

//define global variables
var keyword;
var minDate;
var maxDate;
var userid;
var usern;

//filters the actions needed according to the search input
function filterSearch(){
	keyword = document.getElementById('textSearch').value;
	usern = document.getElementById('userSearch').value;
	userid = document.getElementById('idSearch').value;
	minDate = document.getElementById('minDate').value;
	maxDate = document.getElementById('maxDate').value;
	if (keyword.length > 0 || userid.length > 0 || minDate.length > 0 || maxDate.length > 0 || usern.length > 0){
		//if any of these values exist, we'll pass them through search
		
		if(usern.length > 0){
			//if username is specified, determine userid
			
			flickr.people.findByUsername({
			username: usern
			}, function(err,result){
				if (err) {
					alert('Oops! One or more of your search entries is invalid. If searching for a user, please be sure to enter the correct username or NSID.');
					throw new Error(err);
				}
				userid = result.user.id; //set user id
				searchF();
			})
		} else {
			searchF();
		}
	} else {
		//if no keyword or search is specified, perform a generic search for "photos"
		keyword = "photos";
		searchF();
	}
};

var searchresults;
var i;
var j;
//search the Flickr API
function searchF () {
	flickr.photos.search({
		//define 1 or more search terms
		user_id: userid,
		text: keyword,
		min_upload_date: minDate,
		max_upload_date: maxDate
	}, function(err, result){
		if(err) {
			alert('Oops! One or more of your search entries is invalid. If searching for a user, please be sure to enter the correct username or NSID.');
			throw new Error(err);
		}
		for (var l = 1; l < 11; l++){
			//clears the previous images in the results (needed if you enter a new search that returns less than 10 photos)
			document.getElementById('box'+(l)).innerHTML = "";
			document.getElementById('subbox'+(l)).innerHTML = "";
		};

		j = 0;
		for (i = 0; i < 10; i++) {
			j++;
			searchresults = result;
			var item = result.photos.photo[i] //if no error, parse json results
			if (item === undefined){
				alert('No more pictures to show.');
				document.getElementById("nextbutton").disabled = true;
				return;
			}
			
			//URLs as defined by: https://www.flickr.com/services/api/misc.urls.html
			//photo links to photo on Flickr
			var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
			var indivphotoURL = 'https://www.flickr.com/photos/'+item.owner+"/"+item.id;
			userid = item.owner;
			userInfo(i); //runs separate function to determine the username from the userid

			//assign photo to table position
			document.getElementById('table').style.display = 'block';
			document.getElementById('nextbutton').style.display = 'inline-block';
			document.getElementById('prevbutton').style.display = 'inline-block';
			document.getElementById('box'+(i+1)).innerHTML = "<a href="+indivphotoURL+"> <img src="+photoURL+"></a>";
			document.getElementById("nextbutton").disabled = false;
		};	
	})
};

//prints the photo information including username and title
function userInfo (index) {
	flickr.people.getInfo({
		user_id: userid
	}, function(err, result){
		if (err) {throw new Error(err)};
		var username = result.person.username._content;
		var title = searchresults.photos.photo[index].title;
		
		//shorten title after 50 characters
		if (title.length>50){
			title = title.substring(0,47)+"...";
		}
		var userURL = 'https://www.flickr.com/people/'+userid;
		var k = index % 10; //k will indicate which box to put the information in. Can't use 'index' since 'index' is > 10 after the first page
		document.getElementById('subbox'+(k+1)).innerHTML = "Title: "+title+"</br>User: <a href="+userURL+">"+username+"</a>"
	});
};

//finds the information of the photos that belong on the next page of results
function nextpage () {
	j = 0;
	var k = i;

	//start counting from the current photo index
	for (i = k; i < k+10; i++){
		j = j+1;
		
		//same procedure as before
		var item = searchresults.photos.photo[i] //if no error, parse json results
		var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
		var indivphotoURL = 'https://www.flickr.com/photos/'+item.owner+"/"+item.id;
		userid = item.owner;
		userInfo(i);
		document.getElementById('box'+(j)).innerHTML = "<a href="+indivphotoURL+"> <img src="+photoURL+"></a>";
		document.getElementById("prevbutton").disabled = false; //enable 'prev button'
		
		//if it's the last page of results, disable the 'next' button
		if (i>=searchresults.photos.photo.length){
			document.getElementById("prevbutton").disabled = true;
		}
	};
};


//finds the information of the photos that belong on the previous page of results
function prevpage () {
	if (i>10){ //you must be on at least page 2
		j = 0;
		var k =i;

		//start counting from 20 before the index to 10 before the index - so the range is [i-20, i-10)
		for (i = k-20; i < k-10; i++){
			j = j+1;

			//same procedure as before
			var item = searchresults.photos.photo[i] //if no error, parse json results
			var photoURL = 'http://farm' + item.farm + '.static.flickr.com/' + item.server + '/' + item.id + '_' + item.secret + '_m.jpg';
			var indivphotoURL = 'https://www.flickr.com/photos/'+item.owner+"/"+item.id;
			userid = item.owner;
			userInfo(i);
			document.getElementById('box'+(j)).innerHTML = "<a href="+indivphotoURL+"> <img src="+photoURL+"></a>";
		};

		//if you return to the first page in the process, disable 'prev button'
		if (i==10){
			document.getElementById("prevbutton").disabled = true;
		}
	}
};

