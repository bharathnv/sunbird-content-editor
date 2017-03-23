/**
 * Content service helps to retrieve/save the content, content meta details by making call to learning API.
 * It also helps to download the content. 
 * 
 * @class EkstepEditor.contentService
 * @author Sunil A S <sunils@ilimi.in>
 */
EkstepEditor.contentService = new(EkstepEditor.iService.extend({
    serviceURL: EkstepEditor.config.baseURL + EkstepEditorAPI.getConfig('apislug') + '/learning/',
    content: {},
    initService: function() {},
    /**
    *
    * content meta data fields
    *
    * @memberof EkstepEditor.contentService
    */
    contentFields: "body,editorState,stageIcons,templateId,languageCode,template,gradeLevel,status,concepts,versionKey,name,appIcon,contentType,owner,domain,code,visibility,portalOwner,description,language,mediaType,mimeType,osId,languageCode,createdOn,lastUpdatedOn",
    requestHeaders: {
        "headers": {
            "content-type": "application/json",
            "user-id": "content-editor"
        }
    },
    /**
    * 
    * sets content meta for the given content id
    * @param id {string}
    * @param contentMeta {object} content meta object
    * @private
    * @memberof EkstepEditor.contentService
    */
    _setContentMeta: function(id, contentMeta) {
        if (id && contentMeta) {
            var meta = {};
            for(k in contentMeta) {
                if(k != 'body' && k != 'stageIcons') {
                    meta[k] = contentMeta[k];
                }
            }
            this.content[id] = meta;
        }
    },
    /**
    *
    * returns content meta details
    * @param id {string} content id
    * @returns {object} if id is "undefined" returns empty object
    *
    * @memberof EkstepEditor.contentService
    */
    getContentMeta: function(id) {
        return this.content[id] || {};
    },
    /**
    *
    * saves content body by making call to learing API 
    * @param contentId {string} content id
    * @param metadata {object} meta data object
    * @param body {object} ECML JSON object of content
    * @param callback {function} callback function 
    *
    * @memberof EkstepEditor.contentService
    */
    saveContent: function(contentId, metadata, body, callback) {
        this._saveContent(contentId, metadata, body, callback);
    },
    /**
    *
    * saves content body by making call to learing API 
    * @param contentId {string} content id
    * @param metadata {object} meta data object
    * @param body {object} ECML JSON object of content
    * @param callback {function} callback function 
    * @private
    * @memberof EkstepEditor.contentService
    *
    */
    _saveContent: function(contentId, metadata, body, callback) {

        var instance = this;
        var versionKey = instance.content[contentId] && instance.content[contentId].versionKey;

        if (contentId && versionKey) {
            var update = false;
            var content = {
                versionKey: versionKey
            }
            if (metadata) {
                update = true;
                for (k in metadata) {
                    content[k] = metadata[k];
                }
            }
            if (body) {
                content['body'] = JSON.stringify(body);
                update = true;
            }
            if (update) {
                var headers = { "headers": { "content-type": "application/json", "user-id": "ATTool" } }
                var requestObj = { request: { content: content } };
                instance.http.patch(this.serviceURL + 'v2/content/' + contentId, requestObj, headers, function(err, res) {
                    if (res) {
                        instance.content[contentId].versionKey = res.data.result.versionKey;
                    }
                    callback(err, res);
                });
            } else {
                callback('Nothing to save');
            }
        } else {
            callback('Cannot find content id or version key to update content');
        }
    },
    /**
    *
    *
    * retrieves the content and content meta details
    * @param contentId {string} content id
    * @param callback {function} callback function
    *
    * @memberof EkstepEditor.contentService
    */
    getContent: function(contentId, callback) {
        var instance = this;
        if (contentId) {
            var metaDataFields = "?fields=" + instance.contentFields;
            instance.http.get(this.serviceURL + 'v2/content/' + contentId + metaDataFields, {}, function(err, res) {
                if (err) callback(err, undefined);
                if (!err && res.data && res.data.result && res.data.result.content) {
                    instance._setContentMeta(contentId, res.data.result.content);
                    callback(err, res.data.result.content);
                } else {
                    callback(new Error('no content found!'), undefined)
                }

            });
        } else {
            callback('Content id is required to get content from platform', undefined);
        }
    },
    /**
     * retrieves template data of selected templateid
     * @param templateId {string} template id
     * @param callback {function} callback function
     * @memberof EkstepEditor.contentService
     */
    getTemplateData: function(templateId, callback){
        var instance = this;
        var templateMetaFields = "?taxonomyId=literacy_v2&fields=body,editorState,templateId,languageCode";
        instance.http.get(this.serviceURL + 'v2/content/' + templateId + templateMetaFields, this.requestHeaders, function(err, res) {
            callback(err, res)
        });
    },
    /**
    *
    *
    * retrieves downloadable URL link to content
    * @param contentId {string} content id
    * @param fileName {string} "name" parameter of meta data object
    * @param callback {function} callback function
    *
    * @memberof EkstepEditor.contentService
    */
    downloadContent: function(contentId, fileName, callback) {
        var data = { "request": { "content_identifiers": [contentId], "file_name": fileName } };
        this.postFromService(this.serviceURL + 'v2/content/bundle', data, this.requestHeaders, callback);
    },
    postFromService: function(url, data, headers, callback) {
        var instance = this;
        instance.http.post(url, JSON.stringify(data), headers, function(err, res) {
            callback(err, res)
        });
    }
}));
