/**
 * Free Web File Manager is free software released under MIT License.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED
 * TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
 * CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
 * DEALINGS IN THE SOFTWARE.
 *
 * George Sarafov
 * http://freewebfilemanager.com
 *
 */

function GsItem(itemData) {
    this.itemData = itemData;

    this.getSize = function() {
        if (this.itemData.size < 1e6) {
            return Math.ceil(this.itemData.size / 1e3) + ' KB';
        } else {
            return Math.ceil(this.itemData.size / 1e6) + ' MB';
        }
    };

    this.getExtension = function() {
        return this.itemData.extension.toLowerCase();
    };

    this.getLastMod = function() {
        return this.itemData.lastMod;
    };

    this.isPicture = function() {
        return gs_ext_pictures.hasOwnProperty(this.itemData.extension);
    };

    this.isEditable = function() {
        return gs_ext_editables.hasOwnProperty(this.itemData.extension);
    };

    this.isArchive = function() {
        return gs_ext_arhives.hasOwnProperty(this.itemData.extension);
    };

    this.isDirectory = function() {
        return this.itemData.type == 'dir';
    };

    this.getFileType = function() {
        var fileType = 'unknown';
        if (this.isPicture()) {
            fileType = 'picture';
        } else if (this.isEditable()) {
            fileType = 'editable';
        } else if (this.isArchive()) {
            fileType = 'archive';
        }
        return fileType;
    };
};

function GsClipboard() {
    this.items = [];
    this.action;
    this.clear = function() {
        this.items = [];
        this.action = null;
    }
    this.getItemCount = function () {
        return this.items.length;
    }
    this.getAction = function() {
        return this.action;
    }
    this.getPaths = function() {
        return this.items.map(function(elem) {
            return elem.itemData.path;
        });
    }
    this.addItemsForCut = function(items) {
        this.addItems(items, '8');
    }
    this.addItemsForCopy = function(items) {
        this.addItems(items, '7');
    }
    this.addItems = function(items, action) {
        this.action = action;
        var thisClipboard = this;
        jQuery('#gs_content_table div.rowSelected').each(function() {
            var id = jQuery(this).attr('rel');
            if (typeof items[id] != 'undefined') {
                thisClipboard.items.push(items[id]);
            }
        });
    }
    this.refreshView = function() {
        var actionInWords = '';
        if (this.action) {
            actionInWords = '(' + this.getActionInWords() + ') ';
        }
        jQuery('#gsClipBoard').text(actionInWords + this.getItemCount() + ' ' + gs_getTranslation('en', 30));
    }
    this.getActionInWords = function() {
        if (this.action === '7') return 'Copy';
        if (this.action === '8') return 'Cut';
        return '';
    }
    this.showContentInWindow = function() {
        var thisClipboard = this;
        var div = jQuery('#gsclipboardContent');
        var divHtml = '';
        for (var i = 0; i < this.items.length; i++) {
            var item = this.items[i];
            divHtml += '<div class="' + (item.isDirectory() ? 'directory' : 'file') + '" ext_' + item.itemData.extension + '">&nbsp;&nbsp;&nbsp;' + item.itemData.path + '</div>';
        }
        div.html(divHtml);
        div.dialog({
            title: 'Clipboard',
            modal: true,
            buttons: {
                Clear: function() {
                    thisClipboard.clear();
                    thisClipboard.refreshView();
                    jQuery(this).dialog('close');
                }
            }
        });
    }
}

function noAction() { return false; }

function gs_get_cur_item(id) {
    var result = null;
    if (typeof(gs_cur_items[id]) != 'undefined') {
        result = gs_cur_items[id];
    }
    return result;
}

function gs_show_loading() {
    jQuery("#gs_dir_content").html('<div class="loadingDiv">&nbsp;</div>');
}

function gsGetSelectedItems() {
    var arr = [];
    jQuery('#gs_content_table div').filter('.rowSelected').each(function() {
        var filename = jQuery(this).text();
        arr.push(filename);
    });
    return arr;
}

function gsCheckResponse(data) {
    if (typeof data == 'undefined') return;
    if (data.substr(0, 9) == '{result: ') {
        var my_response = data;
        if (typeof my_response.result != 'undefined') {
            if (my_response.result == '1') {

            } else if (typeof my_response.gserror != 'undefined') {
                alert(my_response.gserror);
            } else {
                alert('Error');
            }
        }
    }
}

function gs_makeUrl(root, params) {
    if (root.indexOf('?') !=-1) {
        return root + '&' + params;
    } else {
        return root + '?' + params;
    }
}

var gs_filemanager_languages = {};

gs_filemanager_languages['en'] = [];
gs_filemanager_languages['en'][1] = 'Current Dir';
gs_filemanager_languages['en'][2] = 'Clipboard';
gs_filemanager_languages['en'][3] = 'Upload';
gs_filemanager_languages['en'][4] = 'New File';
gs_filemanager_languages['en'][5] = 'New Directory';
gs_filemanager_languages['en'][6] = 'Paste';
gs_filemanager_languages['en'][7] = 'Name';
gs_filemanager_languages['en'][8] = 'Type';
gs_filemanager_languages['en'][9] = 'Size';
gs_filemanager_languages['en'][10] = 'Last Modified';
gs_filemanager_languages['en'][11] = 'Open with';
gs_filemanager_languages['en'][14] = 'Copy';
gs_filemanager_languages['en'][15] = 'Cut';
gs_filemanager_languages['en'][16] = 'Rename';
gs_filemanager_languages['en'][17] = 'Copy As';
gs_filemanager_languages['en'][18] = 'Download';
gs_filemanager_languages['en'][19] = 'Delete';
gs_filemanager_languages['en'][20] = 'Open';
gs_filemanager_languages['en'][23] = 'Select all';
gs_filemanager_languages['en'][24] = 'Deselect all';
gs_filemanager_languages['en'][25] = 'Invert selection';
gs_filemanager_languages['en'][26] = 'Width';
gs_filemanager_languages['en'][27] = 'Height';
gs_filemanager_languages['en'][28] = 'Cancel';
gs_filemanager_languages['en'][29] = 'Upload File';
gs_filemanager_languages['en'][30] = 'Items';
gs_filemanager_languages['en'][31] = 'Save';
gs_filemanager_languages['en'][34] = 'As name';
gs_filemanager_languages['en'][35] = 'New name';
gs_filemanager_languages['en'][36] = 'File name';
gs_filemanager_languages['en'][37] = 'Directory name';
gs_filemanager_languages['en'][38] = 'Are you sure that you want to deleted selected items?';
gs_filemanager_languages['en'][39] = 'Zip directory';
gs_filemanager_languages['en'][40] = 'Zip file';
gs_filemanager_languages['en'][41] = 'Zip archive name';
gs_filemanager_languages['en'][42] = 'UnZip';
gs_filemanager_languages['en'][43] = 'UnZip Name';
gs_filemanager_languages['en'][44] = 'Lock sizes';
gs_filemanager_languages['en'][45] = 'Folder';

gs_filemanager_languages['de'] = [];
gs_filemanager_languages['de'][1] = 'Aktuelles Verzeichnis';
gs_filemanager_languages['de'][2] = 'Clipboard';
gs_filemanager_languages['de'][3] = 'Hochladen';
gs_filemanager_languages['de'][4] = 'Neue Datei';
gs_filemanager_languages['de'][5] = 'Neuer Ordner';
gs_filemanager_languages['de'][6] = 'Einfügen';
gs_filemanager_languages['de'][7] = 'Name';
gs_filemanager_languages['de'][8] = 'Typ';
gs_filemanager_languages['de'][9] = 'Größe';
gs_filemanager_languages['de'][10] = 'Geändert';
gs_filemanager_languages['de'][11] = 'Öffnen mit';
gs_filemanager_languages['de'][14] = 'Kopieren';
gs_filemanager_languages['de'][15] = 'Ausschneiden';
gs_filemanager_languages['de'][16] = 'Umbenennen';
gs_filemanager_languages['de'][17] = 'Kopieren als';
gs_filemanager_languages['de'][18] = 'Herunterladen';
gs_filemanager_languages['de'][19] = 'Löschen';
gs_filemanager_languages['de'][20] = 'Öffnen';
gs_filemanager_languages['de'][23] = 'Alle auswählen';
gs_filemanager_languages['de'][24] = 'Keine auswählen';
gs_filemanager_languages['de'][25] = 'Auswahl umkehren';
gs_filemanager_languages['de'][26] = 'Breite';
gs_filemanager_languages['de'][27] = 'Höhe';
gs_filemanager_languages['de'][28] = 'Abbrechen';
gs_filemanager_languages['de'][29] = 'Datei hochladen';
gs_filemanager_languages['de'][30] = 'Einträge';
gs_filemanager_languages['de'][31] = 'Speichern';
gs_filemanager_languages['de'][34] = 'Als Name';
gs_filemanager_languages['de'][35] = 'Neuer Name';
gs_filemanager_languages['de'][36] = 'Dateiname';
gs_filemanager_languages['de'][37] = 'Ordnername';
gs_filemanager_languages['de'][38] = 'Ausgewählte Datei(en) wirklich löschen?';
gs_filemanager_languages['de'][39] = 'Zip Ordner';
gs_filemanager_languages['de'][40] = 'Zip Datei';
gs_filemanager_languages['de'][41] = 'Zip-Dateiname';
gs_filemanager_languages['de'][42] = 'UnZip';
gs_filemanager_languages['de'][43] = 'UnZip-Dateiname';
gs_filemanager_languages['de'][44] = 'Größe verriegeln';
gs_filemanager_languages['de'][45] = 'Ordner';

function gs_getTranslation(lg, code) {
    var result = '';
    if (typeof gs_filemanager_languages[lg] != 'undefined' &&
        typeof gs_filemanager_languages[lg][code] != 'undefined') {
        result = gs_filemanager_languages[lg][code];
    }
    return result;
}

var gs_cur_items = [];
var gs_clipboard = new GsClipboard();

var gs_ext_editables = {
    'txt':  null,
    'php':  null,
    'doc':  null,
    'js' :  null,
    'html': null,
    'htm':  null,
    'rtf':  null,
    'css':  null,
    'java': null,
    'asp':  null,
    'xml':  null,
    'xls':  null,
    'sql':  null,
    'log':  null
};

var gs_ext_pictures = {
    'png':  null,
    'jpg':  null,
    'jpeg': null,
    'gif':  null,
    'pdf':  null,
    'ico':  null
};

var gs_ext_arhives = {
    'zip': null
};

var gs_forbidden_ext_mapping = {
    'editable': '15,16,17,23',
    'picture':  '12,18,23',
    'unknown':  '12,15,16,17,18,23',
    'archive':  '12,15,16,17,18,19'
};

// Clipboard loeschende Aktionen
var clipboardClearingActions = {
    '4': null, // delete item
    '6': null, // delete item
    '7': null, // copy
    '8': null, // cut
    '10': null, // rename
    '13': null, // copy as
    '19': null, // zip
    '23': null // unzip
};

if (jQuery) (function(jQuery) {

    jQuery.extend(jQuery.fn, {
        gsFileManager: function(o) {
            if (!o) var o = {};
            if (o.root == undefined) o.root = '/';
            if (o.language == undefined) o.language = 'en';
            if (o.script == undefined) o.script = 'jqueryFileTree.php';
            if (o.expandSpeed == undefined) o.expandSpeed= 500;
            if (o.collapseSpeed == undefined) o.collapseSpeed= 500;
            if (o.expandEasing == undefined) o.expandEasing = null;
            if (o.collapseEasing == undefined) o.collapseEasing = null;
            if (o.loadMessage == undefined) o.loadMessage = 'Loading...';

            var menuHtml = '<table class="gsHeadTable" cellpadding=0 cellspacing=0><tr><td><span class="gsHeadText"> ' + gs_getTranslation(o.language, 1)+ ': </span><span id=\'curDir\'></span></td><td><a href=\'javascript: void(0);\' onClick=\'return gs_clipboard.showContentInWindow();\' class=\'gs_dir_content_button\'>&nbsp;' + gs_getTranslation(o.language, 2)+ '&nbsp;</a><span id=\'gsClipBoard\'>0 items</span> </td></tr></table>';
            menuHtml += '<a id="gs_uploadbutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 3)+ '&nbsp;</a>';
            menuHtml += '<a id="gs_newfilebutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 4)+ '&nbsp;</a>';
            menuHtml += '<a id="gs_newdirbutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 5)+ '&nbsp;</a>';
            menuHtml += '<a id="gs_pastebutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 6)+ '&nbsp;</a>';
            menuHtml += '<a id="gs_selectallbutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 23)+ '&nbsp;</a>';
            menuHtml += '<a id="gs_deselectbutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 24)+ '&nbsp;</a>';
            menuHtml += '<a id="gs_invertselectbutton" class="gs_dir_content_button">&nbsp;' + gs_getTranslation(o.language, 25)+ '&nbsp;</a>';
            var wrapperHtml = '<div id="gs_dir_list" class="gs_dir_list" onClick="jQuery(this).doGSAction({action: 21})"></div>';
            wrapperHtml    += '<div class="gs_dir_content" onClick="jQuery(this).doGSAction({action: 21})">'
                                 + '<div class="gs_dir_content_menu">';
            wrapperHtml += menuHtml;
            wrapperHtml    += '     </div>';
            wrapperHtml    += '<div class=\'gs_delimiter\'>&nbsp;</div>';
            wrapperHtml    += '<div id=\'gs_dir_content\' class=\'gs_dir_content_files\'></div>';
            wrapperHtml    += '</div></div>';

            var contexMenus = '<ul id="gsFileMenu" class="contextMenu">';
            contexMenus += '<li class="edit"><a href="#edit">' + gs_getTranslation(o.language, 11)+ '</a></li>';
            contexMenus += '<li class="copy separator"><a href="#Copy" rel="7">' + gs_getTranslation(o.language, 14)+ '</a></li>';
            contexMenus += '<li class="cut"><a href="#Cut" rel="8">' + gs_getTranslation(o.language, 15)+ '</a></li>';
            contexMenus += '<li class="rename"><a href="#Rename" rel="10">' + gs_getTranslation(o.language, 16)+ '</a></li>';
            contexMenus += '<li class="rename"><a href="#Copy As" rel="13">' + gs_getTranslation(o.language, 17)+ '</a></li>';
            contexMenus += '<li class="zip"><a href="#zip" rel="19">' + gs_getTranslation(o.language, 40)+ '</a></li>';
            contexMenus += '<li class="zip"><a href="#zip" rel="23">' + gs_getTranslation(o.language, 42)+ '</a></li>';
            contexMenus += '<li class="download separator"><a href="#Download" rel="11">' + gs_getTranslation(o.language, 18)+ '</a></li>';
            contexMenus += '<li class="delete"><a href="#Delete" rel="6">' + gs_getTranslation(o.language, 19)+ '</a></li>';
            contexMenus += '</ul>';

            contexMenus += '<ul id="gsDirMenu" class="contextMenu">';
            contexMenus += '<li class="directorymenu"><a href="#Open" rel="5">' + gs_getTranslation(o.language, 20)+ '</a></li>';
            contexMenus += '<li class="copy separator"><a href="#Copy" rel="7">' + gs_getTranslation(o.language, 14)+ '</a></li>';
            contexMenus += '<li class="cut"><a href="#Cut" rel="8">' + gs_getTranslation(o.language, 15)+ '</a></li>';
            contexMenus += '<li class="rename"><a href="#Rename" rel="10">' + gs_getTranslation(o.language, 16)+ '</a></li>';
            contexMenus += '<li class="zip"><a href="#zip" rel="19">' + gs_getTranslation(o.language, 39)+ '</a></li>';
            contexMenus += '<li class="zip"><a href="#zip" rel="23">' + gs_getTranslation(o.language, 42)+ '</a></li>';
            contexMenus += '<li class="delete"><a href="#Delete" rel="4">' + gs_getTranslation(o.language, 19)+ '</a></li>';
            contexMenus += '</ul>';

            contexMenus += '<ul id="gsContentMenu" class="contextMenu">';
            contexMenus += '<li class="paste separator"><a href="#Paste" rel="9">' + gs_getTranslation(o.language, 6)+ '</a></li>';
            contexMenus += '<li class="newfile separator"><a href="#New File" rel="2">' + gs_getTranslation(o.language, 4)+ '</a></li>';
            contexMenus += '<li class="newdir"><a href="#New Directory" rel="3">' + gs_getTranslation(o.language, 5)+ '</a></li>';
            contexMenus += '<li class="uploadfolder separator"><a href="#Upload" rel="14">' + gs_getTranslation(o.language, 3)+ '</a></li>';
            contexMenus += '<li class="selection separator"><a href="#Select All" rel="20">' + gs_getTranslation(o.language, 23)+ '</a></li>';
            contexMenus += '<li class="selection"><a href="#>Deselect all" rel="21">' + gs_getTranslation(o.language, 24)+ '</a></li>';
            contexMenus += '<li class="selection"><a href="#Invert selection" rel="22">' + gs_getTranslation(o.language, 25)+ '</a></li>';
            contexMenus += '</ul>';

            wrapperHtml    += contexMenus;

            var hiddenElements = '<div id="gsclipboardContent" style="display: none"></div>';
            hiddenElements += '<div id="gsuploadfiles" style="display: none; position: relative;">';
            hiddenElements +=  '<form action="' + o.script +'" id="gsUploadForm" enctype="multipart/form-data"><input type="hidden" name="opt" value="11"><input type="hidden" name="dir" value="">';
            hiddenElements +=  '<div class="fileinputs"><input type="file" name="filename" size="30" id="gsUploadButton"></div></form>';
            hiddenElements += '</div>';
            wrapperHtml += hiddenElements;
            jQuery(this).html(wrapperHtml);

            jQuery('#gs_dir_content').contextMenu({
                menu: 'gsContentMenu',
                addSelectedClass: false
            },
                function(action, el, pos) {
                    jQuery(el).doGSAction({action: action, script: o.script, type: 'context', lg: o.language});
            });

            jQuery('#gs_uploadbutton').click(function(e) {
                e.stopPropagation();
                jQuery(this).doGSAction({action: 14, script:  o.script, type: 'file', lg: o.language});
            });

            jQuery('#gs_newfilebutton').click(function(e) {
                e.stopPropagation();
                jQuery(this).doGSAction({action: 2, script: o.script, type: 'file', lg: o.language});
            });

            jQuery('#gs_newdirbutton').click(function(e) {
                e.stopPropagation();
                jQuery(this).doGSAction({action: 3, script: o.script, type: 'dir', lg: o.language});
            });

            jQuery('#gs_pastebutton').click(function(e) {
                e.stopPropagation();
                jQuery(this).doGSAction({script: o.script, action: 9, lg: o.language});
            });

            jQuery('#gs_selectallbutton').click(function(e) {
                e.stopPropagation();
                jQuery(this).doGSAction({action: 20, script: o.script, type: 'context', lg: o.language});
            });

            jQuery('#gs_deselectbutton').click(function(e) {
                e.stopPropagation();
                jQuery(this).doGSAction({action: 21, script: o.script, type: 'context', lg: o.language});
            });

            jQuery('#gs_invertselectbutton').click(function(e) {
                e.stopPropagation();
                return jQuery(this).doGSAction({action: 22, script: o.script, type: 'context', lg: o.language});
            });

            jQuery('#gsUploadForm').ajaxForm({
                    beforeSubmit: function() {
                        jQuery('#gsuploadfiles').append('<div class="loadingDiv">&nbsp;</div>');
                    },
                    success: function(responseText, statusText, xhr, form) {
                        gsCheckResponse(responseText);
                        jQuery('#'+jQuery("#curDir").attr('rel')).trigger('click');
                        jQuery('#gsuploadfiles').find('div.loadingDiv').remove();
                    },
                    dataType: 'script'
            });

            function showFiles(gsfiless) {
                var fileshtml = '';
                for (var i = 0; i < gsfiless.length; i++) {
                    var curItem = gsfiless[i];
                    gs_cur_items[curItem.itemData.id] = curItem;
                    fileshtml += "<tr><td><div class='file gsItem directory_info ext_" + curItem.getExtension() + "' rel=\'" + curItem.itemData.id + "\'>" + curItem.itemData.name + "</div></td><td><span class=\'file_ext_name\'>" + curItem.getExtension() + "</span> file</td><td>" + curItem.getSize() + "</td><td>"+curItem.getLastMod()+"</td></tr>";
                }
                return fileshtml;
            }

            function manageGsMenu(srcElement, menu) {
                if (srcElement.attr('rel') == 'up') {
                    return false;
                }
                var gs_item = gs_cur_items[srcElement.attr('rel')];
                var type = gs_item.getFileType();
                if (gs_forbidden_ext_mapping.hasOwnProperty(type)) {
                    menu.disableContextMenuItems(gs_forbidden_ext_mapping[type]);
                }
                return true;
            }

            function showDirs(gsfiless) {
                var fileshtml = '';
                var gs_lastparent = jQuery('#' + jQuery("#curDir").attr('rel')).parent().parent().parent().children('a');
                if (gs_lastparent.length > 0) {
                    fileshtml += "<tr><td><div class='directory directory_info gsItem' rel=\'up\'><a href='javascript:void(0)' ondblclick=\"jQuery('#" + jQuery("#curDir").attr('rel')+ "').parent().parent().parent().children('a').trigger('click'); return false\"> ..up</a></div></td><td>" + gs_getTranslation(o.language, 45) + "</td></tr>";
                }
                for (var i = 0; i < gsfiless.length; i++) {
                    var curItem = gsfiless[i];
                    gs_cur_items[curItem.itemData.id] = curItem;
                    fileshtml += "<tr><td><div class='directory directory_info gsItem' rel=\'" + curItem.itemData.id + "\'><a href='javascript:void(0)' ondblclick=\"jQuery('#"+curItem.itemData.id+"').trigger('click'); return false\">" + curItem.itemData.name + "</a></div></td><td>" + gs_getTranslation(o.language, 45) + "</td><td>0</td><td>"+curItem.getLastMod()+"</td></tr>";
                }
                return fileshtml;
            }

            function showContent(gsdirss, gsfiless) {
                var dirshtml = showDirs(gsdirss);
                var fileshtml = showFiles(gsfiless);
                var tableheader = '<table class="dirs_files_table" cellpadding=0 cellspacing=2 id="gs_content_table"><tr><th>' + gs_getTranslation(o.language, 7)+ '</th><th width=\'10%\'>' + gs_getTranslation(o.language, 8)+ '</th><th width=\'10%\'>' + gs_getTranslation(o.language, 9)+ '</th><th width=\'20%\'>' + gs_getTranslation(o.language, 10)+ '</th></tr>';
                jQuery('#gs_dir_content').html(tableheader + dirshtml + fileshtml + "</table>");

                jQuery('div.file').contextMenu({
                    menu: 'gsFileMenu'
                },
                    function(action, el, pos) {
                       jQuery(el).doGSAction({action: action, script: o.script, type: 'file', lg: o.language});
                },
                manageGsMenu);
                jQuery('table.dirs_files_table tr').find('div.gsItem.file').dblclick(function(e) {
                    jQuery(this).doGSAction({action: 11, script: o.script, type: 'file', lg: o.language});
                });
                jQuery('table.dirs_files_table tr').find('div.gsItem').on('click', function(e) {
                    var cur_element = jQuery(this);
                    var rel = jQuery(this).attr('rel');
                    if (rel != 'up') {
                        cur_element.toggleClass('rowSelected');
                    }
                    jQuery(".contextMenu").hide();
                    return false;
                });

                jQuery('div.directory').contextMenu({
                    menu: 'gsDirMenu'
                },
                    function(action, el, pos) {
                        jQuery(el).doGSAction({action: action, script: o.script, type: 'dir',lg: o.language});
                },
                manageGsMenu);

            }

            function showTree(c, directory) {
                var cObject = jQuery(c);
                cObject.addClass('wait');
                gs_show_loading();
                jQuery(".jqueryFileTree.start").remove();
                jQuery.ajax({
                    type: 'POST',
                    url: o.script,
                    data: { dir: directory },
                    dataType: 'json',
                    contentType: 'application/x-www-form-urlencoded; charset=UTF-8',
                    success: function(data) {

                        gsdirs = []; // global
                        for (var i = 0; i < data.gsdirs.length; i++) {
                            gsdirs.push(new GsItem(data.gsdirs[i]));
                        }
                        gsfiles = []; // global
                        for (var i = 0; i < data.gsfiles.length; i++) {
                            gsfiles.push(new GsItem(data.gsfiles[i]));
                        }

                        jQuery('#curDir').text(directory);
                        jQuery('#curDir').attr('rel', jQuery('a', cObject).attr('id')); // remember current dir id

                        gs_cur_items = [];

                        var dirhtml = '<ul class="jqueryFileTree" style="display: none;">';
                        for (var i = 0; i < gsdirs.length; i++) {
                             var curItem = gsdirs[i];
                             dirhtml += '<li class="directoryMeny collapsed"><span class="dir_index toggleplus">&nbsp;&nbsp;&nbsp;&nbsp;</span><a href="javascript:void(0)" rel="' + curItem.itemData.path + '/" id="' + curItem.itemData.id + '">' + curItem.itemData.name + '</a></li>';
                        }
                        dirhtml += "</ul>";

                        cObject.find('.start').html('');
                        cObject.find('ul').remove();
                        cObject.removeClass('wait');
                        cObject.append(dirhtml);

                        showContent(gsdirs, gsfiles);

                        if (o.root == directory) {
                            cObject.find('ul:hidden').show();
                        } else {
                            cObject.find('ul:hidden').slideDown({ duration: o.expandSpeed, easing: o.expandEasing });
                        }
                        setHandlers(cObject);
                   }});
            }

            function setHandlers(t) {
                //jQuery(t).find('li').droppable();
                jQuery(t).find('li > a').on('click', function() {
                    showTree(jQuery(this).parent(), jQuery(this).attr('rel'));
                    jQuery(this).parent().removeClass('collapsed').addClass('expanded');
                    jQuery(this).parent().find(' > span').removeClass('toggleplus').addClass('toggleminus');
                });
                jQuery(t).find('li > span').on('click', function() {
                    var thisEl = jQuery(this);
                    if (thisEl.parent().hasClass('collapsed')) {
                        thisEl.parent().find('ul').slideDown({ duration: o.collapseSpeed, easing: o.collapseEasing });
                        var contenUL = thisEl.parent().find('ul');
                        if (contenUL.length < 1) {
                            thisEl.parent().find('a').trigger('click');
                            thisEl.parent().find(' > span').removeClass('toggleplus').addClass('toggleminus');
                        }
                        thisEl.parent().removeClass('collapsed').addClass('expanded');
                        thisEl.parent().find(' > span').removeClass('toggleplus').addClass('toggleminus');
                    } else {
                        thisEl.parent().find('ul').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
                        thisEl.parent().removeClass('expanded').addClass('collapsed');
                        thisEl.parent().find(' > span').removeClass('toggleminus').addClass('toggleplus');
                    }
                });
            }

            function showRoot() {
                showTree(jQuery('#gs_dir_list'), o.root);
                //jQuery(this).parent().parent().find('ul').slideUp({ duration: o.collapseSpeed, easing: o.collapseEasing });
                //jQuery(this).parent().parent().find('li.directory').removeClass('expanded').addClass('collapsed');
            }

            var cusElement = jQuery('#gs_dir_list');
            // Loading message
            cusElement.html('<ul class="jqueryFileTree start"><li class="wait">' + o.loadMessage + '<li></ul>');
            // Get the initial file list
            cusElement.prepend('<a href="javascript:void(0)" id="rootLink">root</a>');
            cusElement.find('#rootLink').on('click', showRoot);

            showRoot();
        },

        doGSAction: function(o) {
            if (clipboardClearingActions.hasOwnProperty(o.action)) {
                gs_clipboard.clear();
                gs_clipboard.refreshView();
            }
            if (o.action == '20') { // select all
                jQuery('#gs_content_table div.gsItem[rel!="up"]').addClass('rowSelected');
                return false;
            }
            if (o.action == '21') { // deselect all
                jQuery("#gs_content_table div.gsItem").removeClass('rowSelected');
                return false;
            }
            if (o.action == '22') { // invert select
                jQuery('#gs_content_table div.gsItem[rel!="up"]').toggleClass('rowSelected');
                return false;
            }
            var curDir = jQuery('#curDir').text();
            var dataForSend = null;
            var gsitem = gs_get_cur_item(jQuery(this).attr('rel'));

            if (o.action == '23') { // unzip
                unZipItems(o, curDir, gsitem);
                return;
            }
            if (o.action == '13') { // copy as
                copyAs(o, curDir, gsitem);
                return;
            }
            if (o.action == '14') { // show upload
                jQuery('#gsuploadfiles').dialog({title: gs_getTranslation(o.lg, 29), modal: true, width: 460, height: 460,
                    buttons: [ {text: gs_getTranslation(o.lg, 28),
                                click: function() {
                                            jQuery(this).dialog("close");
                                        }
                               },
                               {
                               text: gs_getTranslation(o.lg, 3),
                               click: function() {
                                           jQuery(this).find("input[name=dir]").val(curDir);
                                           jQuery('#gsUploadForm').submit();
                                       }
                             }]
                });
                return;
            }
            if (o.action == '19') { // zip
                zipItems(o, curDir, gsitem);
                return;
            }
            if (o.action == '7') { // copy
                gs_clipboard.addItemsForCopy(gs_cur_items);
                gs_clipboard.refreshView();
                return;
            }
            if (o.action == '8') { // cut
                gs_clipboard.addItemsForCut(gs_cur_items);
                gs_clipboard.refreshView();
                return;
            }
            if (o.action == '9') { // paste
                pasteItems(o, curDir, gsitem);
                return;
            }
            if (o.action == '10') { // rename
                renameItem(o, curDir, gsitem);
                return;
            }
            if (o.action == '11') { // download
                dataForSend = {opt: 8, filename: gsitem.itemData.name, dir: curDir};
                location.href= gs_makeUrl(o.script, jQuery.param(dataForSend));
                return;
            }
            if (o.action == '2') { // new file
                newFile(o, curDir, gsitem);
                return;
            }
            if (o.action == '3') { // new dir
                newDir(o, curDir, gsitem);
                return;
            }
            if (o.action == '4' || o.action == '6') { // delete item
                deleteItems(o, curDir, gsitem);
                return;
            }
            if (o.action == '5') { // open dir
                jQuery('#' + gsitem.itemData.id).trigger('click');
                return;
            }

            function pasteItems(o, curDir, gsitem) {
                var opt = null;
                var clipboardAction = gs_clipboard.getAction();
                if (clipboardAction === '7') { // copy
                    opt = 5;
                } else if (clipboardAction === '8') { // cut
                    opt = 7;
                } else {
                    return;
                }
                dataForSend = {opt: opt, files: gs_clipboard.getPaths(), dir: curDir};
                sendAndRefresh(o, dataForSend, true);

                if (opt == 7) { // cut
                    // TODO divs von verschobenen items loeschen (wird das an anderen stellen auch gemacht?)
                    for (var i = 0; i < gs_clipboard.length; i++) {
                        if (gs_clipboard[i].isDirectory()) {
                            jQuery('#' + gs_clipboard[i].id).parent().remove();
                        }
                    }

                    gs_clipboard.clear();
                    gs_clipboard.refreshView();
                }
            }

            function copyAs(o, curDir, gsitem) {
                var oldName = gsitem.itemData.name;
                var newName = makeNewFilenameForCopy(oldName);
                newName = window.prompt(gs_getTranslation(o.lg, 34) + ': ', newName);
                if (newName == null) {
                    return;
                }
                if (newName == oldName) {
                    alert('Der neue Dateiname muss sich vom alten unterscheiden.');
                    return;
                }
                dataForSend = {opt: 14, filename: gsitem.itemData.name, dir: curDir, newfilename: newName};
                sendAndRefresh(o, dataForSend, true);
            }

            function unZipItems(o, curDir, gsitem) {
                var itemName = gsitem.itemData.name;
                var newName  = window.prompt(gs_getTranslation(o.lg, 43), itemName.substr(0, itemName.lastIndexOf('.')));
                if (newName == null) {
                    return;
                }
                dataForSend = {opt: 17, filename: gsitem.itemData.name, dir: curDir, newfilename: newName};
                sendAndRefresh(o, dataForSend, true);
            }

            function zipItems(o, curDir, gsitem) {
                var newName = window.prompt(gs_getTranslation(o.lg, 41), gsitem.itemData.name + '.zip');
                if (newName == null) {
                    return;
                }
                dataForSend = {opt: 16, filename: gsitem.itemData.name, dir: curDir, newfilename: newName};
                sendAndRefresh(o, dataForSend, true);
            }

            function renameItem(o, curDir, gsitem) {
                var newName = window.prompt(gs_getTranslation(o.lg, 35) + ': ', gsitem.itemData.name);
                if (newName == null) {
                    return;
                }
                dataForSend = {opt: 6, filename: curDir + gsitem.itemData.name, dir: curDir, newfilename: newName};
                sendAndRefresh(o, dataForSend, true);
            }

            function newFile(o, curDir, gsitem) {
                var newName = window.prompt(gs_getTranslation(o.lg, 36) + ': ');
                if (newName == null || newName.length < 1) {
                    return;
                }
                dataForSend = {opt: 2, filename: newName, dir: curDir};
                sendAndRefresh(o, dataForSend, true);
            }

            function newDir(o, curDir, gsitem) {
                var newName = window.prompt(gs_getTranslation(o.lg, 37) + ': ');
                if (newName == null || newName.length < 1) {
                    return;
                }
                dataForSend = {opt: 3, filename: newName, dir: curDir};
                sendAndRefresh(o, dataForSend, true);
            }

            function deleteItems(o, curDir, gsitem) {
                var selectedFiles = gsGetSelectedItems();
                if (selectedFiles.length == 0 || !window.confirm(gs_getTranslation(o.lg, 38))) {
                    return;
                }
                dataForSend = {opt: 4, files: selectedFiles, dir: curDir};
                sendAndRefresh(o, dataForSend, true);
            }

            function sendAndRefresh(o, dataForSend, refresh, callback, type) {
                if (refresh) {
                    gs_show_loading();
                }
                if (typeof(type) == 'undefined') {
                    type = 'text';
                }
                dataForSend.dir = dataForSend.dir;
                jQuery.ajax({
                    type: 'POST',
                    url: o.script,
                    data: jQuery.param(dataForSend) + '&time='+ new Date().getTime(),
                    dataType: type,
                    contentType: 'application/x-www-form-urlencoded;charset=utf-8',
                    beforeSend: function(xhr) {
                       xhr.setRequestHeader('Accept', "text/html; charset=utf-8");
                    },
                    success: function(data) {
                        gsCheckResponse(data);
                        if (refresh) {
                            jQuery('#'+jQuery("#curDir").attr('rel')).trigger('click');
                        }
                        if (callback) {
                            callback(data);
                        }
                    }
                });
            }
        }
    });

})(jQuery);

function makeNewFilenameForCopy(oldFilename) {
    var DOT = '.';
    var APPENDAGE = ' (1)';
    var nameParts = oldFilename.split(DOT);
    if (nameParts.length > 1) {
        nameParts[nameParts.length - 2] += APPENDAGE;
        return nameParts.join(DOT);
    } else {
        return oldFilename + APPENDAGE;
    }
}

//jQuery Context Menu Plugin
//
// Version 1.01
//
// Cory S.N. LaViska
// A Beautiful Site (http://abeautifulsite.net/)
//
// More info: http://abeautifulsite.net/2008/09/jquery-context-menu-plugin/
//
// Terms of Use
//
// This plugin is dual-licensed under the GNU General Public License
//   and the MIT License and is copyright A Beautiful Site, LLC.
//
if (jQuery) (function() {
    jQuery.fn.extend({

        contextMenu: function(o, callback, onShowMenu) {
            // Defaults
            if (o.menu == undefined) return false;
            var menu = jQuery('#' + o.menu);

            if (o.addSelectedClass == undefined) o.addSelectedClass = true;
            if (o.inSpeed  == undefined) o.inSpeed  = 150;
            if (o.outSpeed == undefined) o.outSpeed =  75;
            // 0 needs to be -1 for expected results (no fade)
            o.inSpeed  = o.inSpeed  || -1;
            o.outSpeed = o.outSpeed || -1;

            // This method may also be called on a set, e.g. $('div.file')
            jQuery(this).each(function() {
                var el = jQuery(this);
                var offset = el.offset(); // absolute position
                menu.addClass('contextMenu');

                // Auf Rechtsklick reagieren:
                // $(document).click(...) geht
                // $('div').click(...) geht nicht :(
                // --> deswegen .mouseup
                jQuery(this).mouseup(function(eventMouseUp) {
                    if (eventMouseUp.which != 3) return;
                    eventMouseUp.stopPropagation();
                    var srcElement = jQuery(this);

                    // Hide context menus that may be showing
                    jQuery(".contextMenu").hide();
                    menu.enableContextMenuItems();
                    if (onShowMenu) {
                        if (!onShowMenu(srcElement, menu)) {
                            return false;
                        }
                    }
                    if (!srcElement.hasClass('rowSelected')) {
                        jQuery("#gs_content_table div.gsItem").removeClass('rowSelected');
                        if (o.addSelectedClass) {
                            srcElement.addClass('rowSelected');
                        }
                    }

                    if (jQuery(el).hasClass('disabled')) {
                        return false;
                    }
                    // Detect mouse position
                    var d = {};
                    if (window.self.innerHeight) {
                        d.pageYOffset = window.self.pageYOffset;
                        d.pageXOffset = window.self.pageXOffset;
                        d.innerHeight = window.self.innerHeight;
                        d.innerWidth  = window.self.innerWidth;
                    } else if (document.documentElement &&
                        document.documentElement.clientHeight) {
                        d.pageYOffset = document.documentElement.scrollTop;
                        d.pageXOffset = document.documentElement.scrollLeft;
                        d.innerHeight = document.documentElement.clientHeight;
                        d.innerWidth  = document.documentElement.clientWidth;
                    } else if (document.body) {
                        d.pageYOffset = document.body.scrollTop;
                        d.pageXOffset = document.body.scrollLeft;
                        d.innerHeight = document.body.clientHeight;
                        d.innerWidth  = document.body.clientWidth;
                    }
                    var x = eventMouseUp.pageX ? eventMouseUp.pageX : eventMouseUp.clientX + d.scrollLeft;
                    var y = eventMouseUp.pageY ? eventMouseUp.pageY : eventMouseUp.clientY + d.scrollTop;

                    // Show the menu
                    menu.css({ top: y, left: x }).fadeIn(o.inSpeed);

                    // Hover events
                    menu.find('a').mouseover(function() {
                        menu.find('li.hover').removeClass('hover');
                        if (!jQuery(this).parent().parent().hasClass('subContextMenu')) {
                             menu.find('ul.subContextMenu').hide();
                        }
                        jQuery(this).parent().addClass('hover');
                        jQuery(this).parent().find('ul').css({ top: 0, left: 120 }).fadeIn(o.inSpeed);
                    }).mouseout(function() {
                        menu.find('li.hover').removeClass('hover');
                    });

                    // When items are selected
                    menu.find('a').off('click');
                    menu.find('a').on('click', function() {
                        if (jQuery(this).parent().hasClass('disabled')) {
                           return false;
                        }
                        jQuery(".contextMenu").hide();
                        // Callback
                        if (callback) {
                            callback(jQuery(this).attr('rel'), jQuery(srcElement), {x: x - offset.left, y: y - offset.top, docX: x, docY: y});
                        }
                        return false;
                    });

                    jQuery(':root').mousedown(function() {
                        menu.fadeOut(o.outSpeed);
                    });
                });

                // Disable text selection
                menu.on('mousedown.disableTextSelect', noAction); // Works in FF, IE 10 (and ...?)

                // Disable browser context menu (requires both selectors to work in IE/Safari + FF/Chrome)
                jQuery(el).add(jQuery('ul.contextMenu')).on('contextmenu', noAction);

            });
            return jQuery(this);
        },

        // Disable context menu items on the fly
        disableContextMenuItems: function(o) {
            var element = jQuery(this);
            if (o == undefined) {
                // Disable all
                element.find('li').addClass('disabled');
            } else {
                element.each(function() {
                    var d = o.split(',');
                    for (var i = 0; i < d.length; i++) {
                        //alert(d[i]);
                        element.find('a[rel="' + d[i] + '"]').parent().addClass('disabled');
                    }
                });
            }
            return element;
        },

        // Enable context menu items on the fly
        enableContextMenuItems: function(o) {
            var element = jQuery(this);
            if (o == undefined) {
                // Enable all
                element.find('li').removeClass('disabled');
            } else {
                element.each(function() {
                    var d = o.split(',');
                    for (var i = 0; i < d.length; i++) {
                        element.find('a[rel="' + d[i] + '"]').parent().removeClass('disabled');
                    }
                });
            }
            return element;
        },

        // Disable context menu(s)
        disableContextMenu: function() {
            var element = jQuery(this);
            element.addClass('disabled');
            return element;
        },

        // Enable context menu(s)
        enableContextMenu: function() {
            var element = jQuery(this);
            element.removeClass('disabled');
            return element;
        },

        // Destroy context menu(s)
        destroyContextMenu: function() {
            // Destroy specified context menus
            var element = jQuery(this);
            element.off('mousedown');
            element.off('mouseup');
            return element;
        }

    });
})(jQuery);
