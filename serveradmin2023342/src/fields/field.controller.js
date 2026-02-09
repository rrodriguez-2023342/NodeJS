import Field from './field.model.js';

export const createField = async (req, res) => {
    try {

        const fieldData = req.body;

        /*if (req.file){
            const extension = req.file.split('.').pop();
            const filename = req.file.filename;
            const relativePath = filename.substring(filename.indexOf('/fields'));

            fieldData.photo = `${relativePath}.${extension}`;
        } else {
            fieldData.photo = 'fields/kinal_sports_myvxo5';
        }*/

        const field = new Field(fieldData);
        await field.save();

        res.status(201).json({
            success: true,
            message: 'Campo creado exitosamente',
            data: field
        })

    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error al crear el campo',
            error: error.message
        })
    }
}

export const getFields = async (req, res) => {
    try {
        
        const { page = 1, limit = 10, isActive = true} = req.query;

        const filter = { isActive };

        const options = {
            page: parseInt(page),
            limit: parseInt(limit),
            sort: { createAt: -1}
        }

        const fields = await Field.find(filter)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort(options.sort);

        const total = await Field.countDocuments(filter);

        res.status(200).json({
            success: true,
            data: fields,
            pagination: {
                currentPage: page,
                totalPages: Math.ceil(total / limit),
                totalRecords: total,
                limit
            }
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error al obtner los campos',
            error: error.message
        })
    }
}