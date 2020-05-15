$( document ).ready(() => {
submitPost = () => {

    let postInput = $("#postInput").val();
    let postContainer = $("#posts");

    if(postInput.length < 2) return;

    $.post('/post', { text: postInput }, ({ post, moment }) => {
        postContainer.prepend(`
        <div class="col s12 m8 offset-m2 l11">
        <div class="card-panel grey lighten-5 z-depth-1">
          <span style="float: right">
          ${(post.author_id === post.users.id) ? `<a href="/post/${post.id}"><i
          class="material-icons right red-text" style="cursor: pointer;">delete</i></a>` : null }</span>
          <div class="row valign-wrapper">
            <div class="col s2">
              <img src="/${post.users.profile_image}" alt="" class="circle responsive-img">
            </div>
            <div class="col s10">
              <span class="black-text">
                ${post.text}
              </span>
            </div>
          </div>
          ${post.users.first_name + ' ' + post.users.last_name + ' - ' + 'Just now'}
        </div>
      </div>
        `);
    });
}

onSearchChange = () => {
    let searchResults = $("#search-results");
    let search_result = $("#postInput").val();

    searchResults.empty();

    if(search_result.length > 1) {
        $.post('/search', { search_result }, ({ result }) => {
            result.forEach(r => {
                searchResults.prepend(`
                <div class="col s4 m8 offset-m2 l11">
                <div class="card-panel grey lighten-5 z-depth-1">
                  <div class="row valign-wrapper">
                    <div class="col s2">
                      <img src="${r.profile_image}" alt="" class="circle responsive-img">
                    </div>
                    <div class="col s10">
                      <a href="/profile/${r.id}"><span class="black-text">
                      ${r.first_name + ' ' + r.last_name}
                      </span></a>
                    </div>
                  </div>
                  ${r.email + ' - ' + r.city}
                </div>
              </div>
                `);
            })   
        });
    }
}
});

addFriend = (id) => {
  $.post("/add/" + id, ({ friendship }) => {
      if(friendship) {
        window.location.href = '/dashboard';
      }
   });
}

acceptFriend = (id) => {
  $.post("/accept/" + id, ({ friendship }) => {
    if(friendship) {
      window.location.href = '/dashboard';
    }
 });
}

deleteFriend = (id) => {
  $.ajax({
    url: '/delete/' + id,
    type: 'DELETE',
    success: ({ friendship }) => {
      if(friendship) {
        window.location.href = '/dashboard';
      }
    }
  });
}