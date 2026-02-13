const prisma = require('../config/db.js');
const bcrypt = require ('bcrypt');
const path = require('path');
const {OAuth2Client} = require('google-auth-library');
const client = new OAuth2Client();
const v = require ("validator");
const { create } = require('domain');
const fs = require('fs');
const { pipeline } = require('stream/promises');
async function routes(fastify, options) {
    fastify.get("/admin/users",{ preHandler: [fastify.jwtAuthFun, fastify.verifyAdmin] }, async function (request, reply) 
{
    const adminId = request.user.id;
    try{
        const by = await prisma.user.findMany({
            where: {
                id: {
                    not: adminId 
                }
            }
        });
        reply.send(by);
    }
    catch(err)
    {
        reply.status(500).send({error: "Failed to fetch users"});
    }
})
fastify.post("/register", async (request, reply) => {
    const { username, email, password } = request.body;
    
    if(!username || !email || !password) {
        return reply.status(400).send({error: "all the three fields are required"});
    }
    
    if(!v.isStrongPassword(password)) {
        return reply.status(400).send({error: "Password too weak: it must be at least 8 characters, include an uppercase letter, a number, and a symbol."});
    }
    
    if(!v.matches(username, /^[A-Za-z0-9_]+$/)) {
        return reply.status(400).send({error: "Username can only have letters, numbers, and underscores."});
    }
    
    if(!v.isEmail(email)) {
        return reply.status(400).send({error: "follow the email format"});
    }
    
    try {
        const mysalt = await bcrypt.genSalt(10);
        const myhash = await bcrypt.hash(password, mysalt);
        const user = await prisma.user.create({
            data: {
                username, 
                email, 
                password: myhash,
                role: "user"
            }
        });
        
        const token = fastify.jwt.sign({
            id: user.id,
            email: user.email
        }, {expiresIn: "24h"});
        
        reply.status(201).send({
            success: true,
            message: "User created successfully!",
            user,
            token
        });
        
    } catch (error) {
        if(error.code == "P2002") {
            return reply.status(400).send({
                error: "the username or email already taken try again"
            });
        }
        return reply.status(500).send({error: "failed to register the user"});
    }
});
fastify.post("/login", async function (request, reply) {
    const { username, password } = request.body;
    try {
        const user = await prisma.user.findUnique({
            where: { username: username }
        });
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return reply.status(401).send({ error: "Invalid username or password" });
        }
        const token = fastify.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, { expiresIn: "1h" });
        await prisma.user.update({
            where: { id: user.id },
            data: { isOnline: true }
        });

        return reply.status(200).send({
            username: user.username,
            email: user.email,
            role: user.role,
            token
        });
    } catch (error) {
        return reply.status(500).send({ error: "Login failed" });
    }
});
fastify.post("/google-auth", async function (request, reply) {
    const { token } = request.body;
    try {
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const { email, sub: googleId, name } = payload;
        let user = await prisma.user.findUnique({ where: { email } });

        if (!user) {
            let finalUsername = name.replace(/\s+/g, "").toLowerCase();
            const usernameExists = await prisma.user.findUnique({ where: { username: finalUsername } });
            
            if (usernameExists) {
                finalUsername = `${finalUsername}${Math.floor(Math.random() * 1000)}`;
            }

            user = await prisma.user.create({
                data: {
                    email,
                    username: finalUsername,
                    googleId,
                    isOnline: true,
                    role: "user"
                }
            });
        } else {
            user = await prisma.user.update({
                where: { email },
                data: { isOnline: true, googleId }
            });
        }

        const sessionToken = fastify.jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role 
        }, { expiresIn: "1h" });

        reply.send({ message: "Login successful", token: sessionToken });

    } catch (error) {
        reply.status(500).send({ error: "Google Auth failed" });
    }
});
    fastify.get("/me", {preHandler :[fastify.jwtAuthFun]}, async function (request, reply){
    try{
        const record = await prisma.user.findUnique({
            where:{
                id: request.user.id,
            },
            select:{
                id: true,
                username: true,
                email: true,
                avatar: true,
                role: true,
                googleId: true
            }
        })
        const isGoogleUser = !!record.googleId;
        const { googleId, ...userWithoutGoogleId } = record;
        
        reply.status(200).send({
            ...userWithoutGoogleId,
            isGoogleUser
        });
    }
    catch(err) 
    { 
        console.error(err);
        reply.status(500).send({ error: "Internal Server Error" });
    }
})
        fastify.patch("/update", {preHandler :[fastify.jwtAuthFun]}, async function (request, reply){
        if(request.isMultipart())
        {
            console.log("✅ DETECTED! About to parse file...");
            try {
                const data = await request.file();
                const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!allowedTypes.includes(data.mimetype)) {
                    return reply.status(400).send({error: "Only image files allowed (jpg, png, gif, webp)"});
                }
                
                const ext = path.extname(data.filename);
                const newName = Date.now() + '-' + Math.random().toString(36).substring(7) + ext;
                const savePath = path.join(__dirname, '..', '..', 'uploads', newName);
                
                await pipeline(data.file, fs.createWriteStream(savePath));
                
                const avatarurl = "/uploads/" + newName;
                const upUser = await prisma.user.update({
                    where: { id: request.user.id },
                    data: { avatar: avatarurl }
                });
                
                console.log("✅ Avatar saved:", avatarurl);
                
                return reply.send({ 
                    success: true,
                    user: upUser
                });
                
            } catch (e) {
                console.error("❌ File upload error:", e.message);
                return reply.status(500).send({ error: "Failed to upload avatar" });
            }
        }
        if(request.body) {
            const {username, email, password} = request.body;
            const updateData = {};
            
            try {
                if(username) {
                    const updu = await prisma.user.findUnique({
                        where: {username: username}
                    });
                    if(updu && updu.id != request.user.id) {
                        return reply.status(400).send({error: "Username already taken"});
                    }
                    updateData.username = username;
                } 
                
                if(email) {
                    const upde = await prisma.user.findUnique({
                        where: {email: email}
                    });
                    if(upde && upde.id != request.user.id) {
                        return reply.status(400).send({error: "Email already taken"});
                    }
                    updateData.email = email;
                }
                if(password) {
                    const currentPassword = request.body.currentPassword;
                    const userWithPassword = await prisma.user.findUnique({
                        where: { id: request.user.id },
                        select: { password: true, googleId: true }
                    });
                    if (userWithPassword.googleId && !userWithPassword.password) {
                        return reply.status(400).send({
                            error: "Google users cannot set a password. Please use Google Sign-In."
                        });
                    }
                    if (!currentPassword) {
                        return reply.status(400).send({
                            error: "Current password is required to set a new password"
                        });
                    }
                    
                    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, userWithPassword.password);
                    if (!isCurrentPasswordValid) {
                        return reply.status(400).send({
                            error: "Current password is incorrect"
                        });
                    }
                    if(!v.isStrongPassword(password)) {
                        return reply.status(400).send({
                            error: "Password too weak: it must be at least 8 characters, include an uppercase letter, a number, and a symbol."
                        });
                    }
                    const mysalt = await bcrypt.genSalt(10);
                    const myhash = await bcrypt.hash(password, mysalt);
                    updateData.password = myhash;
                }
                const newuser = await prisma.user.update({
                    where: {id: request.user.id},
                    data: updateData
                });
                
                return reply.status(200).send({
                    success: true,
                    user: newuser
                });
                
            } catch(err) {
                console.error(err);
                return reply.status(500).send({error: "Failed to update data"});
            }
        }
    });
    fastify.get("/search", {preHandler :[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const q =  request.query.q;

        if (!q || typeof q !== 'string') {
            return reply.status(400).send({error: "Invalid search query"});
        }

        if (q.length > 50) {
            return reply.status(400).send({error: "Search query too long (max 50 characters)"});
        }
        try{
            if(q.length < 2)
            {
                reply.send([]);
                return;
            }
            const data = await prisma.user.findMany({
                where:{
                    username: {
                        contains: q,
                        mode: 'insensitive',
                    },
                    id:{
                        not: request.user.id,
                    }
                },
                select:{
                    username: true,
                    id: true,
                    avatar: true,
                }
            })
            reply.status(200).send({data});
        }
            catch(err){
                reply.status(500).send({error: "we cant find that user to add "});
            }
    })
    fastify.post("/friends/request/:targetId", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply) 
{
    const userId = request.user.id;
    const targetId = parseInt(request.params.targetId);
    if (!targetId || isNaN(targetId)) {
        return reply.status(400).send({error: "Invalid user ID"});
    }
    if (userId === targetId) {
        return reply.status(400).send({error: "You cannot send a friend request to yourself"});
    }
    
    try {
        const targetUser = await prisma.user.findUnique({
            where: { id: targetId }
        });
        
        if (!targetUser) {
            return reply.status(404).send({error: "User not found"});
        }
        const existingFriendship = await prisma.friendship.findFirst({
            where: {
                OR: [
                    { requesterId: userId, addresseeId: targetId },
                    { requesterId: targetId, addresseeId: userId }
                ]
            }
        });
        if (existingFriendship) {
            if (existingFriendship.status === "accepted") {
                return reply.status(400).send({error: "You are already friends"});
            } else if (existingFriendship.status === "pending") {
                return reply.status(400).send({error: "Friend request already sent"});
            }
        }
        const create_f = await prisma.friendship.create({
            data: {
                requesterId: userId,
                addresseeId: targetId,
            }
        });
        
        reply.status(201).send({
            message: "Friend request sent successfully",
            friendship: create_f
        });
        
    } catch (error) {
        console.error(error);
        
        if (error.code === "P2002") {
            return reply.status(400).send({
                error: "Friend request already exists"
            });
        }
        
        reply.status(500).send({error: "Failed to send friend request"});
    }
})
    fastify.get("/friends/pending", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply) 
    {
        const findId = request.user.id;
        try{
            const find = await prisma.friendship.findMany({
                where:{
                    addresseeId: findId,
                    status: "pending",
                },
                include:{
                    requester:{
                        select:{
                            id: true,
                            avatar: true,
                            username: true,
                        }
                    }
                }

            })
            reply.status(200).send (find);

        }
        catch(error)
        {
            reply.status(500).send({error: "no user has pending requests"});
        }
    })
    fastify.patch("/accept/:id", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const rowId =  parseInt(request.params.id);
        const receiverId = request.user.id;
        try{
            const checkFrienship = await  prisma.friendship.findUnique({
                where:{
                    id: rowId,
                }
            })
            if(!checkFrienship)
                return reply.status(404).send({ error: "Friend request not found" });
            if(checkFrienship.addresseeId !== receiverId)
                return reply.status(403).send({ error: "u cant accept this request" });
            const changeStatus = await prisma.friendship.update({
                where:{id:rowId},
                data:{status: "accepted"}
            });
            reply.status(200).send({error: "the request is accepted!"});
        }
catch(err) { 
    console.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
}
    })    
    fastify.delete("/friends/request/:id", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const rowId =  parseInt(request.params.id);
        const receiverId = request.user.id;
        try{
            const checkFrienship = await  prisma.friendship.findUnique({
                where:{
                    id: rowId,
                }
            })
            if(!checkFrienship)
                return reply.status(404).send({ error: "Friend request not found" });
            if(checkFrienship.addresseeId !== receiverId && checkFrienship.requesterId !== receiverId)
                return reply.status(403).send({ error: "u cant decline this request" });
            const changeStatus = await prisma.friendship.delete({
                where:{id:rowId}
            });
            reply.status(200).send({error: "the request is declined!"});
        }
catch(err) { 
    console.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
}
    })
    fastify.post("/logout", {preHandler: [fastify.jwtAuthFun]}, async function (request, reply)
    {
        const userId = request.user.id;
        try{
            const toOut = await prisma.user.update({
                where:{id:userId},
                data:{isOnline: false}
            })
            reply.status(200).send({error: "user logout successfully!!!"});
        }
catch(err) { 
    console.error(err);
    reply.status(500).send({ error: "Internal Server Error" }); 
}
    })
    fastify.get("/friends/list", {preHandler:[fastify.jwtAuthFun]}, async function (request, reply)
    {
        const userId = request.user.id;
        try{
            const findFs =  await prisma.friendship.findMany({
                where:{
                    OR:[
                        {requesterId: userId},{addresseeId: userId}
                    ],
                    status: "accepted"
                },
                include: {
                    requester: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            isOnline: true
                        }
                    },
                    addressee: {
                        select: {
                            id: true,
                            username: true,
                            avatar: true,
                            isOnline: true
                        }
                    }
            }
            })
            const friends = findFs.map((frs) =>{
                if(frs.requesterId === userId)
                    return frs.addressee;
                else
                    return frs.requester;
            })
            reply.status(200).send(friends);
        }
catch(err) { 
    console.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
}
        
    })
    fastify.delete("/users/:id", {preHandler:[fastify.jwtAuthFun, fastify.verifyAdmin]}, async function  (request, reply) 
    {
        const adminId = request.user.id;
        const targeId = parseInt(request.params.id);
        try{
            if(targeId === adminId)
            {
                reply.status(400).send({message: "u cant delete urself u are the admin"});
                return;
            }
            const del = await prisma.friendship.deleteMany({
                where:{
                    OR:[
                        {addresseeId: targeId},
                        {requesterId: targeId}
                    ]
                }
            })
            const delUser = await prisma.user.delete({
                where:{
                    id:targeId,
                }
            })
            reply.send({message:"the user deleted successfully from db!"});
        }
catch(err) { 
    console.error(err);
    reply.status(500).send({ error: "Internal Server Error" });
}
    })
    fastify.patch("/admin/users/:id", {preHandler:[fastify.jwtAuthFun, fastify.verifyAdmin]}, async function  (request, reply) 
    {
        const adminId = request.user.id;
        const targetId = parseInt(request.params.id);
        const {username, email, role} = request.body;
        const updateData ={};
        const allowedRoles = ["user", "moderator", "admin"];
        if (role && !allowedRoles.includes(role)) {
            return reply.status(400).send({ message: "Invalid role. Allowed roles: user, moderator, admin" });
        }
                if(targetId === adminId)
        {
            return reply.status(400).send({message: "Admins cannot modify their own account through this endpoint"});
        }

        try{
            if(username)
            {
            const  updu = await prisma.user.findUnique({
            where:{username:username}
            });
            if( updu && updu.id != targetId)
            {reply.status(400).send({error: "Username already taken"})
            return;}
            updateData.username = username;
            } 
            if(email)
            {
            const  upde = await prisma.user.findUnique({
            where:{email:email}
            });
            if(upde && upde.id != targetId)
            {reply.status(400).send({error: "email already taken"});
            return;
            }
            updateData.email = email;
            }
            if(role) {
                    if (role === "admin") {
                        const adminCount = await prisma.user.count({
                            where: { role: "admin" }
                        });
                        if (adminCount > 0 && !request.body.confirmAdminCreation) {
                            return reply.status(400).send({
                                error: "Creating additional admin accounts requires confirmation",
                                requiresConfirmation: true
                            });
                        }
                    }
                    updateData.role = role;
                }
            const user = await prisma.user.update({
                    where: { id: targetId },
                    data: updateData,
                    select: {
                        id: true,
                        username: true,
                        email: true,
                        role: true,
                        avatar: true
        }
                }
            )
            reply.status(200).send({
                    message: "User updated successfully by Admin",
                    user: user
                });
            } catch (error) {
                reply.status(500).send({ message: "Failed to update user", error: error.message });
            }
    })
}

module.exports = routes;