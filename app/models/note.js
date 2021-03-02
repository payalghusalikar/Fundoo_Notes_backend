/**
 * @module       models
 * @file         note.js
 * @description  noteModel class holds the databse related methods 
 * @author       Payal Ghusalikar <payal.ghusalikar9@gmail.com>
 * @since        27/01/2021  
-----------------------------------------------------------------------------------------------*/

const mongoose = require("mongoose");
const logger = require("../../logger/logger.js");
const Label = require("../models/label.js");
const User = require("../models/user.js");
//const User = mongoose.model("User", UserSchema);
const NoteSchema = mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    labelId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Label",
    }, ],
    isArchived: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    collaborator: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    }, ],

    __v: { type: Number, select: false },
}, {
    timestamps: true,
});
const Note = mongoose.model("Note", NoteSchema);

class NoteModel {
    /**
     * @param {*} noteInfo
     * @param {*} callback
     */
    create = (noteInfo, callback) => {
        const note = new Note({
            title: noteInfo.title,
            description: noteInfo.description,
            userId: noteInfo.userId,
        });
        note.save(callback);
    };

    /**
     *
     * @param {*} callback
     */
    findAll = (callback) => {
        Note.find((error, data) => {
            if (error) {
                logger.error("Some error occurred");
                return callback(new Error("Some error occurred"), null);
            } else {
                return callback(null, data);
            }
        });
    };

    /**
     *
     * @param {*} noteID
     * @param {*} callback
     */
    findOne = (noteID, callback) => {
        Note.findById(noteID, callback);
    };

    /**
     *
     * @param {*} labelId
     * @param {*} callback
     */
    findNotesByLabel = (labelId, callback) => {
        Note.findById(labelId, callback);
    };

    /**
     *
     * @param {*} noteInfo
     * @param {*} callback
     */
    update = (noteInfo, callback) => {
        Note.findByIdAndUpdate(
            noteInfo.noteID, {
                title: noteInfo.title,
                description: noteInfo.description,
            }, { new: true },
            callback
        );
    };

    /**
     * @description delete the id from databse and returns the result to service
     * @param {*} noteID coming from service class
     * @param {*} callback callback for service class
     */
    deleteById = (noteID, callback) => {
        Note.findByIdAndRemove(noteID, callback);
    };

    /**
     * @description add lable to single note
     * @param {*} noteInfo holds labelid and noteId
     * @param {*} callback returns error or data to service
     */
    addLabelToSingleNote = (noteInfo, callback) => {
        Note.findById(noteInfo.noteID, (error, noteData) => {
            if (error) callback(error, null);
            else if (!noteData.labelId.includes(noteInfo.labelId)) {
                return Note.findByIdAndUpdate(
                    noteInfo.noteID, {
                        $push: {
                            labelId: noteInfo.labelId,
                        },
                    }, { new: true },
                    callback
                );
            }
            callback(error, null);
        });
    };

    removeLabel = (noteInfo, callback) => {
        logger.info("label found");
        return Note.findByIdAndUpdate(
            noteInfo.noteID, {
                $pull: { labelId: noteInfo.labelId },
            }, { new: true },
            callback
        );
    };

    deleteNoteById = (noteID, callback) => {
        Note.findById(noteID, (error, data) => {
            if (error) return callback(error, null);
            else {
                logger.info("Note found");
                Note.findByIdAndRemove(noteID, callback);
                return callback(null, data);
            }
        });
    };

    removeNote = (noteID, callback) => {
        Note.findByIdAndUpdate(
            noteID, { isDeleted: true }, { new: true },
            callback
        );
    };

    // findCollaborator = (collaborator, callback) => {
    //     console.log("mdl");
    //     console.log(collaborator.collaboratorId);
    //     console.log(collaborator);
    //     const id = collaborator.collaboratorId;
    //     return User.findOneuserWithId(id, (error, data) => {
    //         if (error) {
    //             logger.error("Some error occurred");
    //             console.log("mdl e ", error);
    //             return callback(new Error("Some error occurred"), null);
    //         } else if (data) {
    //             console.log("user found with this id", data);
    //             return Note.findById(collaborator.noteId, (error, noteData) => {
    //                 console.log("mdl noteData ", noteData);
    //                 console.log("mdl in db ", noteData.collaborator);
    //                 console.log("mdl from user ", collaborator.collaboratorId);
    //                 if (error) callback(error, null);
    //                 // else if (!noteData.collaborator.includes(collaborator.collaboratorId)) {
    //                 return Note.findByIdAndUpdate(
    //                     collaborator.noteId, {
    //                         $push: {
    //                             collaborator: collaborator.collaboratorId,
    //                         },
    //                     }, { new: true },
    //                     // callback
    //                     (error, data) => {
    //                         if (error) {
    //                             logger.error("Some error occurred");
    //                             return callback(new Error("Some error occurred"), null);
    //                         } else {
    //                             console.log("user data afte adding in mdl ", data);
    //                             //return callback(null, data);
    //                             return data;
    //                         }
    //                     }
    //                 );
    //                 //  }

    //                 // return callback(data, null);
    //             });
    //         }
    //     });
    // };

    findCollaborator = (collaborator) => {
        console.log("mdl");
        console.log(collaborator.collaboratorId);
        console.log(collaborator);
        const id = collaborator.collaboratorId;
        // return User.findOneuserWithId(id).then((data) => {
        //     if (error) {
        //         logger.error("Some error occurred");
        //         console.log("mdl e ", error);
        //         // return callback(new Error("Some error occurred"), null);
        //     } else if (data) {
        //         console.log("user found with this id", data);
        return Note.findById(collaborator.noteId).then((noteData) => {
            console.log("mdl noteData ", noteData);
            console.log("mdl in db ", noteData.collaborator);
            console.log("mdl from user ", collaborator.collaboratorId);
            // if (error) callback(error, null);
            if (!noteData.collaborator.includes(collaborator.collaboratorId)) {
                return Note.findByIdAndUpdate(
                    collaborator.noteId, {
                        $push: {
                            collaborator: collaborator.collaboratorId,
                        },
                    }, { new: true }
                    // callback
                    // (error, data) => {
                    //     if (error) {
                    //         logger.error("Some error occurred");
                    //         return callback(new Error("Some error occurred"), null);
                    //     } else {
                    //         console.log("user data afte adding in mdl ", data);
                    //         //return callback(null, data);
                    //         return data;
                    //     }
                    // }
                );
                //  }

                //         // return callback(data, null);
                //     });
                // }
            }
        });
    };

    // else if (!noteData.labelId.includes(noteInfo.labelId)) {
    //     return Note.findByIdAndUpdate(
    //         noteInfo.noteID, {
    //             $push: {
    //                 labelId: noteInfo.labelId,
    //             },
    //         }, { new: true },
    //         callback
    //     );
    // }
    // callback(error, null);

    removeCollaborator = (noteInfo, callback) => {
        return Note.findByIdAndUpdate(
            noteInfo.noteID, {
                $pull: { collaborator: noteInfo.collaboratorId },
            }, { new: true },
            callback
        );
    };
}

module.exports = new NoteModel();