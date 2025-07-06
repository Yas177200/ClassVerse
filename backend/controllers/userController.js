const User = require('../models/user');
const Role = require('../models/role');
const Grade = require('../models/grade');
const Course = require('../models/course');


exports.createUser = async (req, res) => {
    try {
        const { firstname, lastname, birthday, username, email, password, role_id } = req.body;
        const role = await Role.findByPk(role_id);
        if (!role) {
            res.status(404).json({
                success: false,
                message: 'Role Not found'
            })
            return;
        }
        const user = await User.create({ firstname, lastname, birthday, username, email, password, role_id });
        res.json({
            success:true,
            message:'signup successfully ☑️'
        })        
    } catch (error) {
        res.status(401).json({
            success:false,
            message:`Failed to signup, username or email already in use ❌❌ ${error}`
        });
    }

};

exports.updateUser = async (req, res) => {
    try{
        const { firstname, lastname, birthday, username, email, role_id, img_src} = req.body;
        const user = await User.findOne({where:{username:username}});
       
        console.log("Hello from backend",username);
        const uuser = await User.update(
                {
                    firstname: firstname,
                    lastname: lastname,
                    email: email,
                    birthday: birthday,
                    role_id: role_id,
                    img_src: img_src
                },
                {
                    where: {
                    username: username,
                    },
                },
            );
        res.json({
            success:true,
            message:'updated successfully ☑️'
        });
    }catch (error) {
        res.status(401).json({
            success:false,
            message:`Failed to update ❌❌ ${error}`,
        });
        console.log('database error:', error)
    } 
};

exports.deleteUser = async (req, res) => {
    try{
        const {id} = req.body;
        const user = await User.findByPk(id);
        if (user.role_id === 3) {
            await Grade.destroy({where: {student_id: id}})
        }
        if (user.role_id === 2) {
            const course = await Course.findOne({where: { teacher_id: id }})
            if (course !== null)
            res.status(500).json({
                success:false,
                message:`Failed to delete Teacher ❌❌: Please remove this Teacher from all Courses`
            });
        }
        await User.destroy({where: { id }});
        res.status(200).json({
            success:true,
            message:'user deleted successfully ☑️'
        });
    }catch (error) {
        res.status(500).json({
            success:false,
            message:`Failed to delete user ❌❌: ${error}`
        });
    } 
};

exports.updatePass = async (req, res) => {
    const {newPass, oldPass, username}  = req.body;
    console.log(newPass, oldPass, username)
    const user = await User.findOne({where: {username}});
    if (oldPass !== user.password) {
        res.json({
            success: false,
            message: 'old password wrong!' 
        })
    }else {
        await User.update(
            {
                password: newPass
            },
            {
                where: {username}
            }
        );

        res.json({
            success: true,
            message: 'Password Updated successfully'
        })
    }
}