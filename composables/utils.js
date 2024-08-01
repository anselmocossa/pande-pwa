export const getInitials = (name) => {
    if (typeof name !== 'string' || !name.trim()) {
        return ''; // Retorna uma string vazia se name não for uma string válida
    }

    const names = name.trim().split(' ');

    if (names.length > 1) {
        return (names[0][0] || '').toUpperCase() + (names[1][0] || '').toUpperCase();
    } else {
        return (names[0][0] || '').toUpperCase() + (names[0][1] || '').toUpperCase();
    }
}



export const getColor = (name) => {
    const initials = getInitials(name)
    const hash = Array.from(initials).reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const colors = ['#F44336', '#E91E63', '#9C27B0', '#673AB7', '#3F51B5', '#2196F3', '#03A9F4', '#00BCD4', '#009688', '#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107', '#FF9800', '#FF5722', '#795548', '#9E9E9E', '#607D8B']
    return colors[hash % colors.length]
}

export const parseMovimentHistory = (history) => {
    const parts = history.split(' || ')
    const [nomePara, obsPart] = parts
    const [nome, para] = nomePara.split(' --> ')
    const obs = obsPart ? obsPart.replace('Obs: ', '') : ''
    return {nome, para, obs}
}

export const formatDate = (dateString) => {
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    }
    return new Date(dateString).toLocaleDateString(undefined, options)
}


export const getColorFile = (extension) => {
    const dataColor = {
        color: 'cyan',
        background: 'white',
        icon: 'mdi-file'
    }
    if (extension === 'jpg' || extension === 'jpeg' || extension === 'png' || extension === 'gif' ||
        extension === '.jpg' || extension === '.jpeg' || extension === '.png' || extension === '.gif') {
        dataColor.icon = 'mdi-file-image'
        dataColor.color = 'purple'
        dataColor.background = 'white'
    } else if (extension === 'doc' || extension === 'docx' || extension === '.doc' || extension === '.docx') {
        dataColor.icon = 'mdi-file-word'
        dataColor.color = 'blue'
        dataColor.background = 'white'
    } else if (extension === 'xls' || extension === 'xlsx' || extension === '.xls' || extension === '.xlsx' || extension === 'csv' || extension === '.csv') {
        dataColor.icon = 'mdi-file-excel'
        dataColor.color = 'green'
        dataColor.background = 'white'
    } else if (extension === 'pdf' || extension === '.pdf') {
        dataColor.icon = 'mdi-file-pdf'
        dataColor.color = 'red'
        dataColor.background = 'white'
    } else if (extension === 'zip' || extension === 'rar' || extension === '.zip' || extension === '.rar') {
        dataColor.icon = 'mdi-folder-zip'
        dataColor.color = 'blue'
        dataColor.background = 'Black'
    } else if (extension === 'txt' || extension === '.txt') {
        dataColor.icon = 'mdi-file-document'
        dataColor.color = 'black'
        dataColor.background = 'white'
    } else if (extension === 'ppt' || extension === 'pptx' || extension === '.ppt' || extension === '.pptx') {
        dataColor.icon = 'mdi-file-powerpoint'
        dataColor.color = 'red'
        dataColor.background = 'white'
    } else if (extension === 'mp3' || extension === 'wav' || extension === '.mp3' || extension === '.wav') {
        dataColor.icon = 'mdi-file-music'
        dataColor.color = 'green'
        dataColor.background = 'white'
    } else if (extension === 'mp4' || extension === 'avi' || extension === '.mov' ||
        extension === '.mp4' || extension === '.avi' || extension === '.mov') {
        dataColor.icon = 'mdi-file-video'
        dataColor.color = 'red'
        dataColor.background = 'white'
    } else if (extension === 'exe' || extension === '.exe') {
        dataColor.icon = 'mdi-file-cad'
        dataColor.color = 'black'
        dataColor.background = 'white'
    } else {
        dataColor.icon = 'mdi-file'
        dataColor.color = 'black'
        dataColor.background = 'white'
    }

    return dataColor
}
