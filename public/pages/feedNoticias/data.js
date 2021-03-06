const getUserName = () => (firebase.auth().currentUser != null ? firebase.auth().currentUser.displayName : '');

const getUrlPhoto = () => (firebase.auth().currentUser != null ? firebase.auth().currentUser.photoURL : '');

export const createPost = (text, locked) => firebase.firestore().collection('posts').add({
  id: firebase.auth().currentUser.uid,
  name: getUserName(),
  photo: getUrlPhoto(),
  message: text,
  like: 0,
  data: firebase.firestore.Timestamp.fromDate(new Date()).toDate().toLocaleString('pt-BR'),
  locked,
  whoLiked: [],
});

export const readPost = callback => firebase.firestore().collection('posts').orderBy('data', 'desc')
  .onSnapshot((querySnapshot) => {
    const posts = [];
    querySnapshot.forEach((doc) => {
      if (!doc.data().locked || doc.data().id === firebase.auth().currentUser.uid) {
        posts.push({ postId: doc.id, ...doc.data() });
      }
    });
    callback(posts);
  });

export function deletePost(uidPost) {
  firebase.firestore().collection('posts').doc(uidPost).delete();
}

export const updateLike = (likes, whoLiked, uidPost) => {
  firebase.firestore().collection('posts').doc(uidPost).update({
    like: likes,
    whoLiked,
  });
};

export const updatePost = (likes, whoLiked, uidPost) => {
  firebase.firestore().collection('posts').doc(uidPost).update({
    like: likes,
    whoLiked,
  });
};

export function addLike(uidPost, user) {
  firebase.firestore().collection('posts').doc(uidPost).get()
    .then((doc) => {
      const whoLiked = doc.data().whoLiked;
      let likes = doc.data().like;
      if (whoLiked.includes(user)) {
        likes = firebase.firestore.FieldValue.increment(-1);
        const index = whoLiked.findIndex(elem => elem === user);
        whoLiked.splice(index, 1);
      } else {
        likes = firebase.firestore.FieldValue.increment(1);
        whoLiked.push(user);
      }
      updateLike(likes, whoLiked, uidPost);
    });
}
