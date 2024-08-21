import UserModel from "../models/usuario.model.js";

class UserRepository {
    async find(filter, options) {
        return await UserModel.find();
    }

    async findById(id) {
        return await UserModel.findById(id);
    }

    async findByEmail(email) {
        return await UserModel.findOne({email:email});
    }

    async save(user) {
        return await user.save();
    }

    async updateById(id, updateData) {
        return await UserModel.findByIdAndUpdate(id, updateData, { new: true });
    }

    async deleteById(id) {
        return await UserModel.findByIdAndDelete(id);
    }
}

export default UserRepository;