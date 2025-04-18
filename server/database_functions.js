async function checkIfUnique(type, value) {
    try {
        let query = '';
        if (type === 1) {
            query = 'SELECT COUNT(*) AS count FROM users WHERE username = $1';
        } else if (type === 2) {
            query = 'SELECT COUNT(*) AS count FROM users WHERE email = $1';
        } else {
            throw new Error('Invalid type');
        }
        const result = await pool.query(query, [value]);
        return parseInt(result.rows[0].count, 10) === 0;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function registerUser(username, email, password) {
    try {
        let query = 'INSERT INTO users (username, email, password) VALUES ($1, $2, $3)';
        await pool.query(query, [username, email, password]);

        query = 'INSERT INTO profiles (username) VALUES ($1)';
        await pool.query(query, [username]);

        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function getUserByIdentifier(identifier) {
    try {
        const query = 'SELECT * FROM users WHERE username = $1 OR email = $2 LIMIT 1';
        const result = await pool.query(query, [identifier, identifier]);
        return result.rows[0] || null;
    } catch (err) {
        console.error(err);
        return null;
    }
}

async function getContact(username) {
    try {
        return new Promise((resolve, reject) => {
            const query = `
                SELECT username
                FROM users
                WHERE users.username = $1
            `;
            pool.query(query, [username], (err, result) => {
                if (err) {
                    console.error('Error fetching user contact:', err);
                    return reject(err);
                }
                if (result.rows.length > 0) {
                    resolve([true, result.rows[0]]);
                } else {
                    resolve([false, 'User not found']);
                }
            });
        });
    } catch (err) {
        console.error('Error in getContact:', err);
        return [false, 'Internal server error'];
    }
}

async function getUserProfile(identifier) {
    try {
        const query = 'SELECT * FROM profiles WHERE username = $1';
        const result = await pool.query(query, [identifier]);
        if (!result.rows || result.rows.length === 0) {
            return { success: false, message: 'No user found' };
        }
        const user = { ...result.rows[0] };
        delete user.user_id;
        return { success: true, message: user };
    } catch (err) {
        return { success: false, message: 'Query error', err };
    }
}

async function profileUpdate(query, countryCode, profileImage, description, username) {
    try {
        await pool.query(query, [countryCode, profileImage, description, username]);
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

async function getCarList() {
    try {
        const query = 'SELECT * FROM cars';
        const result = await pool.query(query);
        return { success: true, data: result.rows };
    } catch (err) {
        console.error(err);
        return { success: false, error: err };
    }
}

async function createChannel(channelName, targetUser, username) {
    console.log("Creating table with: ", channelName, targetUser, username);
    try {
        const query = 'INSERT INTO channels (name, user1, user2) VALUES ($1, $2, $3)';
        await pool.query(query, [channelName, username, targetUser]);
        return true;
    } catch (error) {
        console.error('Error creating channel:', error);
        return false;
    }
}

async function getMessages(channelName) {
    try {
        const query = 'SELECT * FROM messages WHERE channel_name = $1 ORDER BY timestamp ASC';
        const { rows } = await pool.query(query, [channelName]);
        return rows;
    } catch (error) {
        console.error('Error getting messages:', error);
        return [];
    }
}

async function getChannel(channelName) {
    try {
        const query = 'SELECT * FROM channels WHERE name = $1';
        const { rows } = await pool.query(query, [channelName]);
        if (rows.length > 0) {
            return rows[0];
        } else {
            return null;
        }
    } catch (error) {
        console.error('Error getting channel:', error);
        return null;
    }
}

async function saveMessage(channel, message, sender){
    try {
        const query = 'INSERT INTO messages (channel_name, content, sender_name) VALUES ($1, $2, $3)';
        await pool.query(query, [channel, message, sender]);
        return true;
    } catch (error) {
        console.error('Error saving message:', error);
        return false;
    }
}


module.exports = {
    checkIfUnique,
    registerUser,
    getUserByIdentifier,
    getContact,
    getUserProfile,
    profileUpdate,
    getCarList,
    createChannel,
    getMessages,
    getChannel,
    saveMessage
};
 