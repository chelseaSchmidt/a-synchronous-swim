(function() {

  const serverUrl = 'http://127.0.0.1:3000';

  //
  // TODO: build the swim command fetcher here
  //
  const fetchSwimCommand = () => {
    $.ajax({
      type: 'GET',
      url: serverUrl,
      data: '',
      success: (data) => {SwimTeam.move(data)}, //change to SwimTeam.move(data)
      error: (err) => {console.error(err)}
    });
  }

  setInterval(fetchSwimCommand, 500);

  /////////////////////////////////////////////////////////////////////
  // The ajax file uplaoder is provided for your convenience!
  // Note: remember to fix the URL below.
  /////////////////////////////////////////////////////////////////////

  const ajaxFileUplaod = (file) => {
    var formData = new FormData();
    formData.append('file', file);
    $.ajax({
      type: 'POST',
      data: formData,
      url: `${serverUrl}/background`,
      cache: false,
      contentType: false,
      processData: false,
      success: (data) => {
        // reload the page
        window.location = window.location.href;
      },
      error: (err) => {
        console.log(err.responseText);
      }
    });
  };

  $('form').on('submit', function(e) {
    e.preventDefault();

    var form = $('form .file')[0];
    if (form.files.length === 0) {
      console.log('No file selected!');
      return;
    }

    var file = form.files[0];
    if (file.type !== 'image/jpeg') {
      console.log('Not a jpg file!');
      return;
    }

    ajaxFileUplaod(file);
  });

})();
