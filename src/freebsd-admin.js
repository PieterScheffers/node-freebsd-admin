// FreeBSD Admin functions

var shell = require('shelljs');
//child_process.execSync
//child_process.spawnSync

// Config
var silent = false;



// Common functions
function runCommand(command) {
	if( shell.exec(command, { silent: silent }).code !== 0 ) {
		console.error( "Command '" + command + "' didn't exit with exit-code zero" );
		exit(1);
	}
}

function removeLineEndings(str) {
	return str.replace('\r\n', '').replace('\n', '');
}

function strContains(str, contains) {
	return str.indexOf(contains) !== -1;
}




// User-managements

function addUserToWheelGroup(user) {
	if( !user ) {
		console.warn('addUserToWheelGroup - user not specified!');
		return;
	}
	addUserToGroup(user, 'wheel');
}

function addUserToGroup(user, group) {
	if( !user || !group ) {
		console.warn('addUserToGroup - user or group not specified!');
		return;
	}

	var command = 'pw group mod ' + group + ' -m ' + user;
	runCommand(command);
}

function addUser(user, group) {
	if( !user ) {
		console.warn('addUser - user not specified!');
		return;
	}

	var command = 'pw user add ' + user;
	if( group ) command += ' -G ' + group;
	runCommand(command);
}

// function usersInGroup(group) {
// 	if( !group ) {
// 		console.warn('usersInGroup - group not specified!');
// 		return;
// 	}

// 	var command = "pw groupshow " + group;
// 	var groupShow = shell.exec(command, { silent: silent }));
	
// 	if( groupShow.code !== 0 ) {
// 		console.error( "Command '" + command + "' didn't exit with exit-code zero" );
// 		exit(1);
// 	}
	
// 	var line = groupShow.output;

// 	// Split on :
// 	var lineParts = removeLineEndings(line).split(':');

// 	// Take last, split that by comma
// 	var users = lineParts[lineParts.length - 1].split(',');

// 	// Remove empty
// 	return users.filter(function(user) {
// 		return (user !== '');
// 	});
// }

function userInGroups(user) {
	if( !user ) {
		console.warn('userInGroups - user not specified!');
		return;
	}

	var command = "groups " + user;
	var groupsCom = shell.exec(command, { silent: silent });
	
	if( groupsCom.code !== 0 ) {
		console.error( "Command '" + command + "' didn't exit with exit-code zero" );
		exit(1);
	}
	
	var line = groupsCom.output;

	// Split on space
	var groups = removeLineEndings(line).split(' ');

	// Remove empty
	return groups.filter(function(group) {
		return (group !== '');
	});

}

function verifyUserInGroup(user, group) {
	if( !user || !group ) {
		console.warn('addUserToGroup - user or group not specified!');
		return;
	}

	var groups = userInGroups(user);

	return groups.indexOf(group) !== -1;
}

// Give user info for user (input name or number)
// Returns array with user info (gid, uid, groups)
function userInfo(user) {
	if( !user ) {
		console.warn('userInfo - user not specified!');
		return;
	}

	var command = "id " + user;
	var idCom = shell.exec(command, { silent: silent });
	
	if( idCom.code !== 0 ) {
		console.error( "Command '" + command + "' didn't exit with exit-code zero" );
		exit(1);
	}
	
	var line = idCom.output;
	var u = {}, str, userParts, i, j, groups;

	var lineParts = removeLineEndings(line).split(" ");
	for (i = lineParts.length - 1; i >= 0; i--) {

		if( strContains(lineParts[i], 'uid=') ) {

			str = lineParts[i].replace('uid=', '');
			userParts = str.replace(')', '').split('(');
			u.uid = { number: Number(userParts[0]), name: userParts[1] };

		} 
		else if( strContains(lineParts[i], 'gid=') ) {

			str = lineParts[i].replace('gid=', '');
			userParts = str.replace(')', '').split('(');
			u.gid = { number: Number(userParts[0]), name: userParts[1] };

		} 
		else if( strContains(lineParts[i], 'groups=') ) {

			str = lineParts[i].replace('groups=', '');
			groups = str.replace(/\)/g, '').split(',');

			u.groups = [];
			for (j = groups.length - 1; j >= 0; j--) {
				var groupData = groups[j].split('(');
				u.groups.push( { number: Number(groupData[0]), name: groupData[1] } );
			}

		}	
	}

	return u;
}

function listUsers() {
	var command = "awk -F\":\" '{print $1}' /etc/passwd";
	var awkCom = shell.exec(command, { silent: silent });
	
	if( awkCom.code !== 0 ) {
		console.error( "Command '" + command + "' didn't exit with exit-code zero" );
		exit(1);
	}
	
	var lines = awkCom.output;
	lines = lines.split('\n');

	lines = lines
		.map(function(line) {
			return line.trim().split('#')[0];
		})
		.filter(function(line) {
			return ( line !== '' );
		});

	return lines;
}

function listGroups() {
	var command = "awk -F\":\" '{print $1}' /etc/group";
	var awkCom = shell.exec(command, { silent: silent });
	
	if( awkCom.code !== 0 ) {
		console.error( "Command '" + command + "' didn't exit with exit-code zero" );
		exit(1);
	}
	
	var lines = awkCom.output;
	lines = lines.split('\n');

	lines = lines
		.map(function(line) {
			return line.trim().split('#')[0];
		})
		.filter(function(line) {
			return ( line !== '' );
		});

	return lines;
}

//////////////////////////////////////////////////////////////
// Chapters                                                 //
//////////////////////////////////////////////////////////////
// Users + Permissions
// System - Startup services, Ports update, freebsd-update
// ZFS
// Jails
// Firewall - block + Jail NAT
// SSHD
// Time (NTPD)
// Node.js (PM2 (startup + scripts), nodemon, browserify etc)
// Apache24 + Virtual hosts
// Nginx
// PHP
// Ruby
// ImageMagick
// FFMPEG
// 


// http://www.cyberciti.biz/faq/howto-freebsd-add-a-user-to-wheel-group/

// Add user to group
// pw group mod {group} -m {user}
// pw group mod wheel -m newUser

// Add user
// pw user add {user} -G {group}
// pw user add newUser -G newGroup

// Verify group membership
// pw groupshow {group}
// pw groupshow wheel
// pw groupshow newUser  (newUser group)
// var gitUser = userInfo('git');
// console.log(gitUser);

var users = listUsers().map(function(user) {
	return userInfo(user);
});

console.log(users.filter(function(user) {
	return (user.gid.name === 'wheel');
})); // 

// var ifconfig = require('wireless-tools/ifconfig');

// ifconfig.status('lo0', function(err, status) {
// 	console.log(status);
// });